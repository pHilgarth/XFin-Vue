<template>
  <form class="molecule-expense-form">
    <!-- TODO - check if v-model accountId can be removed -->
    <MoleculeInputSelect class="organism-transaction__account pb-5" field="account" label="Konto" v-model="accountId"
                         :options="[{ value: bankAccount.id, label: `${bankAccount.accountNumber}`}]" :disabled="true" />

    <MoleculeInputSelect class="pb-5" field="costCenter" v-model="costCenterId" label="Kostenstelle"
                         :options="costCenters.map(c => { return { value: c.id, label: c.name } })" />

    {{ transactionType }}
    <MoleculeInputSelect class="pb-5" :options="transactionTypes" field="transactionType" v-model="transactionType" label="Typ" />

    <!-- TODO - API endpoints for loan and repayments are missing, so this is commented out -->
<!--    <MoleculeInputSelect v-if="transactionTypeItems !== null" class="organism-transaction__transaction-type-item pb-5" field="transactionTypeItem"-->
<!--                         :options="transactionTypeItems.map(t => { return { value: t.id, label: t.reference }})" v-model="transactionTypeItem" label="Darlehen" />-->

    <div class="molecule-expense-form__external-party pb-5">
      <MoleculeInputAutoSuggest field="counter-party" v-model="counterParty" label="Zahlungsempfänger" :items="autoSuggestDevItems"
                                :selectedItem="autoSuggestDevItem" :data-selected-item="autoSuggestDevItemId" @itemPicked="pickItem" />

      <MoleculeInputAutoSuggest field="external-party" v-model="externalParty" label="Zahlungsempfänger" :items="externalParties.map(e => e.name)"
                                :validation="v$.externalParty" :hasErrors="v$.externalParty?.$error"
                                :errorMessageParams="{ externalPartyType: 'Zahlungsempfänger' }"
                                @blur="onBlurExternalParty" @itemPicked="pickExternalParty" />

      <MoleculeInputCheckbox v-if="selectedExternalParty && selectedExternalParty.bankAccount.iban == null" class="pt-3" field="include-external-party-account"
                             v-model="includeExternalPartyAccount" label="Bankdaten hinzufügen" />

      <div v-if="includeExternalPartyAccount" class="molecule-expense-form__external-party-account pt-3">
        <MoleculeInputText class="molecule-expense-form__external-party-iban col-6" field="external-party-iban" v-model="externalPartyIban" label="IBAN" :small="true"
                           :hasErrors="v$.externalPartyIban.$error" :validation="v$.externalPartyIban" @blur="v$.externalPartyIban.$touch()" />

        <Teleport v-if="duplicatedIban" to=".molecule-expense-form__external-party-iban">
          <AtomParagraph class="xfin__form__error molecule-expense-form__iban__error" text="Diese IBAN wird bereits verwendet!"/>
        </Teleport>

        <MoleculeInputText class="col-5" field="external-party-bic" v-model="externalPartyBic" label="BIC" :small="true"
                           :hasErrors="v$.externalPartyBic.$error" :validation="v$.externalPartyBic" @blur="v$.externalPartyBic.$touch()" />
      </div>
    </div>

    <MoleculeInputText class="pb-5" field="reference" v-model="reference" label="Verwendungszweck"
                       :validation="v$.reference" :hasErrors="v$.reference.$error" @blur="v$.reference.$touch()" />

    <MoleculeInputText class="pb-5" field="amount" v-model="amount" label="Betrag"
                       :validation="v$.amount" :hasErrors="v$.amount.$error" @blur="v$.amount.$touch()"/>

    <AtomButton type="primary" text="Speichern" :disabled="v$.$silentErrors.length || duplicatedIban" @click.prevent="save" />
  </form>
</template>

<script>
import { useVuelidate } from "@vuelidate/core";

import AtomButton from '@/components/atoms/AtomButton';
import AtomParagraph from '@/components/atoms/AtomParagraph';
import MoleculeInputAutoSuggest from '@/components/molecules/MoleculeInputAutoSuggest';
import MoleculeInputCheckbox from '@/components/molecules/MoleculeInputCheckbox';
import MoleculeInputSelect from '@/components/molecules/MoleculeInputSelect';
import MoleculeInputText from '@/components/molecules/MoleculeInputText';

import { AccountHolderService } from '@/services/account-holder-service';
import { BankAccountService } from '@/services/bank-account-service';
import { copyService } from '@/services/copy-service';
import { NumberService } from '@/services/number-service';
import { TransactionService } from '@/services/transaction-service';
import { TransactionTypeService } from '@/services/transaction-type-service';
import { transactionValidation } from '@/validation/validations';
import { bicValidator, ibanValidator } from "@/validation/custom-validators";


export default {
  emit: [ 'save' ],
  inject: [ 'userId' ],

  components: {
    AtomButton,
    AtomParagraph,
    MoleculeInputAutoSuggest,
    MoleculeInputCheckbox,
    MoleculeInputSelect,
    MoleculeInputText,
  },

  props: {
    bankAccount: { type: Object, required: true },
    costCenters: { type: Array, required: true },
    externalParties: { type: Array },
    initialBankAccountId: { type: String },
  },

  watch: {
    amount() {
      this.v$.amount.$touch();
    },

    externalParty() {
      this.v$.externalParty.$touch();

      if (this.setSelectedExternalPartyToNull) {
        this.selectedExternalParty = null;
        this.includeExternalPartyAccount = false;
      }

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
        this.duplicatedIban = false;
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

    async transactionType() {
      if (['repayment', 'reserve'].indexOf(this.transactionType) !== -1) {
        try {
          this.transactionTypeItems = await TransactionTypeService.getItems(this.transactionType, this.accountId);
          this.transactionTypeItem = this.transactionTypeItems[0].id;
        } catch (error) {
          console.error(error);
        }
      } else {
        this.transactionTypeItems = null;
        this.transactionTypeItem = null;
      }
    },
  },

  data() {
    return {
      accountId: this.bankAccount.id,
      amount: '',
      costCenterId: this.costCenters[0].id,
      duplicatedIban: false,
      externalParty: '',
      externalPartyIban: null,
      externalPartyBic: null,
      includeExternalPartyAccount: false,
      //helper variable for externalParty watcher, controls the correct show/hide of include-external-party-account checkbox
      setSelectedExternalPartyToNull: true,
      reference: '',
      selectedExternalParty: null,
      transactionType: TransactionTypeService.transactionTypes[0].value,
      transactionTypes: copyService.copyArray(TransactionTypeService.transactionTypes).filter(t => t.value !== 'reserve'),
      transactionTypeItem: null,
      transactionTypeItems: null,
    }
  },

  methods: {
    onBlurExternalParty() {
      this.v$.externalParty.$touch();
      this.externalParty = '';
    },

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

      this.selectedExternalParty = this.externalParties.find(e => e.name === clickedItem) || { name: this.externalParty, bankAccount: {} }
    },

    async save() {
      try {
        if (this.externalPartyIban) {
          const duplicatedBankAccount = this.externalPartyIban
              ? await BankAccountService.getSingleByIban(this.externalPartyIban)
              : null;

          if (duplicatedBankAccount) {
            this.duplicatedIban = true;
            throw new Error(`A bankAccount with iban ${this.externalPartyIban} already exists!`);
          }
          else {
            if (this.selectedExternalParty.id) {
              await BankAccountService.update(this.selectedExternalParty.bankAccount.id, [
                {
                  op: "replace",
                  path: `/iban`,
                  value: this.externalPartyIban,
                },
                {
                  op: "replace",
                  path: `/bic`,
                  value: this.externalPartyBic,
                }
              ]);
            }
            else {
              this.selectedExternalParty = await AccountHolderService.create({
                userId: this.userId,
                name: this.selectedExternalParty.name,
                external: true,
              });

              this.selectedExternalParty.bankAccount = await BankAccountService.create({
                accountHolderId: this.selectedExternalParty.id,
                iban: this.externalPartyIban,
                bic: this.externalPartyBic,
                external: true,
              });
            }
          }
        }

        await TransactionService.create({
          sourceBankAccountId: this.accountId,
          targetBankAccountId: this.selectedExternalParty.bankAccount.id,
          sourceCostCenterId: this.costCenterId,
          //TODO - add transactionType and recurringTransactionId, ReserveId, LoanId in MoleculeExpenseForm
          transactionType: this.transactionType,
          //recurringTransactionId: formData.recurringTransactionId,
          //reserveId: formData.reserveId,
          //loanId: formData.loanId,
          reference: this.reference,
          amount: NumberService.parseFloat(this.amount),
          dateString: new Date().toISOString(),
        });

        this.$router.push('/');
      }
      catch (error) {
        console.error(error);
      }
    },
  },

  setup() {
    return {
      v$: useVuelidate(),
    };
  },

  validations() {
    //it does not work, if I simply assign transactionValidation to validation, it has to be a separate object
    let validation = copyService.copyObject(transactionValidation);

    if (this.includeExternalPartyAccount) {
      validation.externalPartyBic = { bicValidator };
      validation.externalPartyIban = { ibanValidator };
    }

    return validation;
  },
};
</script>