<template>
  <form class="molecule-expense-form">
    <MoleculeInputSelect class="organism-transaction__account pb-5" field="account" label="Konto" v-model="accountId"
                         :options="bankAccounts.map(b => { return { value: b.id, label: `${b.accountNumber} (${b.accountHolderName})`} })" />

    <MoleculeInputSelect class="pb-5" :options="costCenters.map(c => { return { value: c.id, label: c.name } })" field="costCenter" v-model="costCenterId" label="Kostenstelle" />

    <MoleculeInputSelect class="pb-5" :options="transactionRoles" field="transactionRole" v-model="transactionRole" label="Typ" />

    <!-- TODO - API endpoints for loan and repayments are missing -->
    <MoleculeInputSelect v-if="transactionRoleItems !== null" class="organism-transaction__transaction-role-item pb-5" field="transactionRoleItem"
                         :options="transactionRoleItems.map(t => { return { value: t.id, label: t.reference }})" v-model="transactionRoleItem" label="Darlehen" />

    <div class="molecule-expense-form__external-party pb-5">

      <!-- TODO - when saving is implemented, test this, if the checkbox is only shown, when either a new externalParty is created or an existing one without account data is selected -->
      <MoleculeInputAutoSuggest field="external-party" v-model="externalParty" label="Zahlungsempfänger" :items="externalParties.map(e => e.name)"
                                :validation="v$.externalParty" :hasErrors="v$.externalParty?.$error"
                                :errorMessageParams="{ externalPartyType: 'Zahlungsempfänger' }"
                                @blur="onBlurExternalParty"
                                @itemPicked="pickExternalParty"/>

      <!-- TODO - test if the checkbox is shown / hidden properly -->
      <!-- TODO - the box is not shown when typing a substring of an existing externalParty without accountData and then clicking on the item -->
      <MoleculeInputCheckbox v-if="selectedExternalParty && !selectedExternalParty.externalBankAccount?.iban" class="pt-3" field="include-external-party-account"
                             v-model="includeExternalPartyAccount" label="Bankdaten hinzufügen" />

      <div v-if="includeExternalPartyAccount" class="molecule-expense-form__external-party-account pt-3">
        <MoleculeInputText class="col-6" field="external-party-iban" v-model="externalPartyIban" label="IBAN" :small="true"
                           :hasErrors="v$.externalPartyIban.$error" :validation="v$.externalPartyIban" @blur="v$.externalPartyIban.$touch()" />

        <MoleculeInputText class="col-5" field="external-party-bic" v-model="externalPartyBic" label="BIC" :small="true"
                           :hasErrors="v$.externalPartyBic.$error" :validation="v$.externalPartyBic" @blur="v$.externalPartyBic.$touch()" />
      </div>
    </div>

    <MoleculeInputText class="pb-5" field="reference" v-model="reference" label="Verwendungszweck"
                       :validation="v$.reference" :hasErrors="v$.reference.$error" @blur="v$.reference.$touch()" />

    <MoleculeInputText class="pb-5" field="amount" v-model="amount" label="Betrag"
                       :validation="v$.amount" :hasErrors="v$.amount.$error" @blur="v$.amount.$touch()"/>

    <AtomButton type="primary" text="Speichern" :disabled="v$.$silentErrors.length" @click.prevent="save" />
  </form>
</template>

<script>
import {useVuelidate} from "@vuelidate/core";

import AtomButton from '@/components/atoms/AtomButton';
import MoleculeInputAutoSuggest from '@/components/molecules/MoleculeInputAutoSuggest';
import MoleculeInputCheckbox from '@/components/molecules/MoleculeInputCheckbox';
import MoleculeInputSelect from '@/components/molecules/MoleculeInputSelect';
import MoleculeInputText from '@/components/molecules/MoleculeInputText';

import {CopyService} from '@/services/copy-service';
import {TransactionRoleService} from '@/services/transaction-role-service';
import {transactionValidation} from '@/validation/validations';
import {bicValidator, ibanDuplicateValidator, ibanValidator,} from "@/validation/custom-validators";


export default {
  emit: [ 'save' ],

  components: {
    AtomButton,
    MoleculeInputAutoSuggest,
    MoleculeInputCheckbox,
    MoleculeInputSelect,
    MoleculeInputText,
  },

  props: {
    bankAccounts: { type: Array, required: true },
    costCenters: { type: Array, required: true },
    externalParties: { type: Array },
    ibans: { type: Array },
    initialBankAccountId: { type: String },
  },

  created() {
    this.accountId = this.initialBankAccountId || this.bankAccounts[0].id;
    this.costCenterId = this.costCenters[0].id;
  },

  watch: {
    amount() {
      this.v$.amount.$touch();
    },

    externalParty() {
      this.v$.externalParty.$touch();

      this.selectedExternalParty = this.setSelectedExternalPartyToNull
        ? null
        : this.selectedExternalParty;

      this.setSelectedExternalPartyToNull = true;
    },

    externalPartyBic() {
      if (this.externalPartyBic) {
        this.externalPartyBic = this.externalPartyBic.toUpperCase();
        this.v$.externalPartyBic.$touch();
      }
    },

    externalPartyIban() {
      if (this.externalPartyIban) {
        this.externalPartyIban = this.externalPartyIban.toUpperCase();
        this.v$.externalPartyIban.$touch();
      }
    },

    includeExternalPartyAccount() {
      if (!this.includeExternalPartyAccount) {
        this.externalPartyIban = null;
        this.externalPartyBic = null;

        this.v$.externalPartyIban.$reset();
        this.v$.externalPartyBic.$reset();
      }
    },

    async transactionRole() {
      if (['repayment', 'reserve'].indexOf(this.transactionRole) !== -1) {
        try {
          this.transactionRoleItems = await TransactionRoleService.getItems(this.transactionRole, this.accountId);
          this.transactionRoleItem = this.transactionRoleItems[0].id;
        } catch (error) {
          console.error(error);
        }
      } else {
        this.transactionRoleItems = null;
        this.transactionRoleItem = null;
      }
    },
  },

  data() {
    return {
      accountId: null,
      amount: '',
      costCenterId: null,
      externalParty: '',
      externalPartyIban: null,
      externalPartyBic: null,
      includeExternalPartyAccount: false,
      //helper variable for externalParty watcher, controls the correct show/hide of include-external-party-account checkbox
      setSelectedExternalPartyToNull: true,
      reference: '',
      selectedExternalParty: null,
      transactionRole: TransactionRoleService.transactionRoles[0].value,
      transactionRoles: CopyService.copyArray(TransactionRoleService.transactionRoles).filter(t => t.value !== 'reserve'),
      transactionRoleItem: null,
      transactionRoleItems: null,
    }
  },

  methods: {
    onBlurExternalParty() {
      this.v$.externalParty.$touch();
      this.externalParty = '';
    },

    //TODO - I need to test this and the MoleculeInputAutoSuggest in general
    pickExternalParty(event) {
      // highlighting the match is realized by wrapping it in a <strong>-element
      // if the user clicks that part, we get the complete string from parentNode
      const clickedItem =
          event.target.tagName.toLowerCase() === "strong"
              ? event.target.parentNode.innerText
              : event.target.textContent;

      const externalPartyValue = this.externalParty;
      this.externalParty = clickedItem.includes('Neu hinzufügen') ? this.externalParty : clickedItem;
      this.setSelectedExternalPartyToNull = externalPartyValue === this.externalParty;

      this.selectedExternalParty = this.externalParties.find(e => e.name === clickedItem) || { name: this.externalParty }
    },

    save() {
      this.selectedExternalParty.iban = this.externalPartyIban;
      this.selectedExternalParty.bic = this.externalPartyBic;

      this.$emit('save', {
        accountId: this.accountId,
        costCenterId: this.costCenterId,
        transactionRole: this.transactionRole,
        transactionRoleItem: this.transactionRoleItem,
        externalParty: this.selectedExternalParty,
        reference: this.reference,
        amount: this.amount
      });
    },
  },

  setup() {
    return {
      v$: useVuelidate(),
    };
  },

  validations() {
    //it does not work, if I simply assign transactionValidation to validation, it has to be a separate object
    let validation = CopyService.copyObject(transactionValidation);

    if (this.includeExternalPartyAccount) {
      validation.externalPartyBic = { bicValidator };
      validation.externalPartyIban = { ibanValidator, ibanDuplicate: ibanDuplicateValidator(this.ibans) };
    }

    return validation;
  },
};
</script>