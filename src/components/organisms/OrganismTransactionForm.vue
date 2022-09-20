<template>
  <form class="organism-transaction-form">
    <div class="organism-transaction-form__payer">
      <AtomHeadline class="organism-transaction-form__headline" tag="h5" text="Zahlungspflichtiger" />
      <div class="col-6 pb-5 pe-3">
        <MoleculeInputAutoSuggest field="payer-account" v-model="payerAccount" label="Konto" :required="true" :items="payerAccounts"
                                  :allowNewItems="true" :validation="v$.payerAccount" :hasErrors="v$.payerAccount.$error"
                                  @itemPicked="pickItem($event, 'payerAccount')" @blur="onBlurPayerAccount"/>

      </div>

      <div class="col-6 pb-5 ps-3">
        <MoleculeInputAutoSuggest field="payer-cost-center" :selectedItem="payerCostCenter" label="Kostenstelle" :required="payerAccount && !payerAccount.external"
                                  :items="payerCostCenters" :disabled="payerAccount?.external"
                                  :validation="v$.payerCostCenter" :hasErrors="v$.payerCostCenter.$error"
                                  @itemPicked="pickItem($event, 'payerCostCenter')" @blur="v$.payerCostCenter.$touch()"/>
<!--        <MoleculeInputSelect class="pb-5" field="payerCostCenter" v-model="payerCostCenterId" label="Kostenstelle"-->
<!--                             :options="payerCostCenters.map(c => { return { value: c.id, label: c.name } })" />-->
      </div>
    </div>

    <div class="organism-transaction-form__payee">
      <AtomHeadline class="organism-transaction-form__headline" tag="h5" text="Zahlungsempfänger" />
      <div class="col-6 pb-5 pe-3">
        <MoleculeInputAutoSuggest field="payee-account" v-model="payeeAccount" label="Konto" :items="payeeAccounts"
                                  :allowNewItems="true" :validation="v$.payeeAccount" :hasErrors="v$.payeeAccount.$error"
                                  @itemPicked="pickItem($event, 'payeeAccount')" @blur="onBlurPayeeAccount" />

      </div>

      <div class="col-6 pb-5 ps-3">
        <MoleculeInputAutoSuggest field="payee-cost-center" :selectedItem="payeeCostCenter" label="Kostenstelle" :items="payeeCostCenters"
                                  :disabled="payeeAccount?.external" @itemPicked="pickItem($event, 'payeeCostCenter')"/>
      </div>
    </div>

    <div class="organism-transaction-form__details">
      <AtomHeadline class="organism-transaction-form__headline" tag="h4" text="Details" />

      <div class="col-6 pb-5 pe-3">
        <MoleculeInputAutoSuggest field="transaction-type" v-model="transactionType" :selectedItem="transactionType" label="Transaktionstyp" :items="transactionTypes"
                                  :validation="v$.transactionType" :hasErrors="v$.transactionType.$error"
                                  @blur="v$.transactionType.$touch()" @itemPicked="pickItem($event, 'transactionType')" />
      </div>

      <div class="col-md-6 ps-3">
        <MoleculeInputAutoSuggest v-if="transactionType && transactionType.id !== 'default'" field="transaction-type" :selectedItem="transactionType" label="Transaktionstyp" :items="transactionTypes"
                                  @itemPicked="pickItem($event, 'transactionType')" />
      </div>

      <div class="col-md-6 pb-5 pe-3">
        <MoleculeInputText field="reference" v-model="reference" label="Verwendungszweck" />
      </div>
      <div class="col-md-6 pb-5 ps-3">
          <MoleculeInputText field="amount" v-model="amount" label="Betrag" />
      </div>
    </div>


    <!-- TODO - API endpoints for loan and repayments are missing, so this is commented out -->
    <!--    <MoleculeInputSelect v-if="transactionTypeItems !== null" class="organism-transaction__transaction-type-item pb-5" field="transactionTypeItem"-->
    <!--                         :options="transactionTypeItems.map(t => { return { value: t.id, label: t.reference }})" v-model="transactionTypeItem" label="Darlehen" />-->

<!--    <div class="molecule-expense-form__external-party pb-5">-->
<!--      <MoleculeInputAutoSuggest field="counter-party" v-model="counterParty" label="Zahlungsempfänger" :items="autoSuggestDevItems"-->
<!--                                :selectedItem="autoSuggestDevItem" :data-selected-item="autoSuggestDevItemId" @itemPicked="pickItem" />-->

<!--      <MoleculeInputAutoSuggest field="external-party" v-model="externalParty" label="Zahlungsempfänger" :items="externalParties.map(e => e.name)"-->
<!--                                :validation="v$.externalParty" :hasErrors="v$.externalParty?.$error"-->
<!--                                :errorMessageParams="{ externalPartyType: 'Zahlungsempfänger' }"-->
<!--                                @blur="onBlurExternalParty" @itemPicked="pickExternalParty" />-->

<!--      <MoleculeInputCheckbox v-if="selectedExternalParty && selectedExternalParty.bankAccount.iban == null" class="pt-3" field="include-external-party-account"-->
<!--                             v-model="includeExternalPartyAccount" label="Bankdaten hinzufügen" />-->

<!--      <div v-if="includeExternalPartyAccount" class="molecule-expense-form__external-party-account pt-3">-->
<!--        <MoleculeInputText class="molecule-expense-form__external-party-iban col-6" field="external-party-iban" v-model="externalPartyIban" label="IBAN" :small="true"-->
<!--                           :hasErrors="v$.externalPartyIban.$error" :validation="v$.externalPartyIban" @blur="v$.externalPartyIban.$touch()" />-->

<!--        <Teleport v-if="duplicatedIban" to=".molecule-expense-form__external-party-iban">-->
<!--          <AtomParagraph class="xfin__form__error molecule-expense-form__iban__error" text="Diese IBAN wird bereits verwendet!"/>-->
<!--        </Teleport>-->

<!--        <MoleculeInputText class="col-5" field="external-party-bic" v-model="externalPartyBic" label="BIC" :small="true"-->
<!--                           :hasErrors="v$.externalPartyBic.$error" :validation="v$.externalPartyBic" @blur="v$.externalPartyBic.$touch()" />-->
<!--      </div>-->
<!--    </div>-->

<!--    <AtomButton type="primary" text="Speichern" :disabled="v$.$silentErrors.length || duplicatedIban" @click.prevent="save" />-->
  </form>
</template>

<script>
//import AtomButton from '@/components/atoms/AtomButton';
import AtomHeadline from '@/components/atoms/AtomHeadline';
import MoleculeInputAutoSuggest from '@/components/molecules/MoleculeInputAutoSuggest';
//import MoleculeInputSelect from '@/components/molecules/MoleculeInputSelect';
import MoleculeInputText from '@/components/molecules/MoleculeInputText';

import { copyService } from '@/services/copy-service';
import { TransactionTypeService } from '@/services/transaction-type-service';

import { transactionValidation } from '@/validation/validations';
import { payerCostCenterValidator } from '@/validation/custom-validators';
import { useVuelidate } from "@vuelidate/core";

export default {
  components: {
    //AtomButton,
    AtomHeadline,
    MoleculeInputAutoSuggest,
    //MoleculeInputSelect,
    MoleculeInputText,
  },

  props: {
    bankAccounts: { type: Array, required: true },
    costCenters: { type: Array, required: true },
    initialPayerAccount: { type: Object },
    initialPayeeAccount: { type: Object },
  },

  data() {
    return {
      amount: null,
      dataLoaded: false,
      loadingError: false,
      payeeAccount: this.initialPayeeAccount || null,
      payeeCostCenter: null,
      payerAccount: this.initialPayerAccount || null,
      payerCostCenter: null,
      reference: null,
      transactionType: null,
      transactionTypes: copyService.copyArray(TransactionTypeService.transactionTypes).map(
          t => { return { id: t.value, label: t.label } }),

      payeeAccounts: copyService.copyArray(this.bankAccounts).map(
          p => { return { id: p.id, label: `${p.accountHolderName} (${p.iban})`, external: p.external} }),
      payeeCostCenters: copyService.copyArray(this.costCenters).map(
          p => { return { id: p.id, label: p.name } }),
      payerAccounts: copyService.copyArray(this.bankAccounts).map(
          p => { return { id: p.id, label: `${p.accountHolderName} (${p.iban})`, external: p.external} }),
      payerCostCenters: copyService.copyArray(this.costCenters).map(
          p => { return { id: p.id, label: p.name}}),
    }
  },

  watch: {
    payeeAccount() {
      if (this.payeeAccount) {
        this.payerAccounts = copyService.copyArray(this.bankAccounts).map(
            p => { return { id: p.id, label: `${p.accountHolderName} (${p.iban})`, external: p.external} });

        this.payerAccounts = this.payeeAccount.external
            ? this.payerAccounts.filter(p => p.id !== this.payeeAccount.id && !p.external)
            : this.payerAccounts.filter(p => p.id !== this.payeeAccount.id);

        this.transactionTypes = this.payeeAccount.external
          ? this.transactionTypes.filter(t => t.id !== 'reserve')
          : copyService.copyArray(TransactionTypeService.transactionTypes).map(
                t => { return { id: t.value, label: t.label } });
      }
      else {
        this.transactionTypes = copyService.copyArray(TransactionTypeService.transactionTypes).map(
            t => { return { id: t.value, label: t.label } });

        this.payerAccounts = copyService.copyArray(this.bankAccounts).map(
            p => { return { id: p.id, label: `${p.accountHolderName} (${p.iban})`, external: p.external} });

        if (this.payerAccount) {
          this.payerAccounts = this.payerAccounts.filter(p => p.id !== this.payerAccount.id);
        }
      }
    },

    payerAccount() {
      if (this.payerAccount) {
        this.payeeAccounts = copyService.copyArray(this.bankAccounts).map(
            p => { return { id: p.id, label: `${p.accountHolderName} (${p.iban})`, external: p.external} });

        this.payeeAccounts = this.payerAccount.external
            ? this.payeeAccounts.filter(p => p.id !== this.payerAccount.id && !p.external)
            : this.payeeAccounts.filter(p => p.id !== this.payerAccount.id);

        if (this.transactionType && this.transactionType.id === 'reserve') {
          this.payeeAccounts = this.payeeAccounts.filter(p => !p.external);
        }

        if (!this.payerAccount.external && this.payeeAccount?.external) {
          this.transactionTypes = this.transactionTypes.filter(t => t.id !== 'reserve');
        }
      }
      else {
        this.payeeAccounts = copyService.copyArray(this.bankAccounts).map(
            p => { return { id: p.id, label: `${p.accountHolderName} (${p.iban})`, external: p.external} });

        if (this.payeeAccount) {
          this.payeeAccounts = this.payeeAccounts.filter(p => p.id !== this.payeeAccount.id);
        }

        if (this.transactionType && this.transactionType.id === 'reserve') {
          this.payeeAccounts = this.payeeAccounts.filter(p => !p.external);
        }
      }
    },

    transactionType() {
      if (this.transactionType && this.transactionType.id === 'reserve') {
        this.payeeAccounts = copyService.copyArray(this.bankAccounts).map(
            p => { return { id: p.id, label: `${p.accountHolderName} (${p.iban})`, external: p.external} });

        this.payeeAccounts = this.payeeAccount
          ? this.payeeAccounts.filter(p => !p.external && p.id !== this.payeeAccount.id)
          : this.payeeAccounts.filter(p => !p.external);

        if (this.payerAccount) {
          this.payeeAccounts = this.payeeAccounts.filter(p => p.id !== this.payerAccount.id);
        }
      }
      else if (this.transactionType && this.transactionType !== 'reserve') {
        this.payeeAccounts = copyService.copyArray(this.bankAccounts).map(
            p => { return { id: p.id, label: `${p.accountHolderName} (${p.iban})`, external: p.external} });

        if (this.payerAccount) {
          this.payeeAccounts = this.payerAccount.external
              ? this.payeeAccounts.filter(p => !p.external && p.id !== this.payerAccount.id)
              : this.payeeAccounts.filter(p => p.id !== this.payerAccount.id);
        }

        if (this.payeeAccount) {
          this.payeeAccounts = this.payeeAccounts.filter(p => p.id !== this.payeeAccount.id);
        }
      }
    }
  },

  methods: {
    onBlurPayerAccount() {
      this.payerAccounts = copyService.copyArray(this.bankAccounts).map(
          p => { return { id: p.id, label: `${p.accountHolderName} (${p.iban})`, external: p.external} });

      if (this.payeeAccount) {
        this.payerAccounts = this.payeeAccount.external
          ? this.payerAccounts.filter(p => p.id !== this.payeeAccount.id && !p.external)
          : this.payerAccounts.filter(p => p.id !== this.payeeAccount.id);
      }

      this.v$.payerAccount.$touch();
    },

    onBlurPayeeAccount() {
      this.payeeAccounts = copyService.copyArray(this.bankAccounts).map(
          p => { return { id: p.id, label: `${p.accountHolderName} (${p.iban})`, external: p.external} });

      if (this.payerAccount) {
        this.payeeAccounts = this.payerAccount.external
            ? this.payeeAccounts.filter(p => p.id !== this.payerAccount.id && !p.external)
            : this.payeeAccounts.filter(p => p.id !== this.payerAccount.id);
      }

      if (this.transactionType && this.transactionType.id === 'reserve') {
        this.payeeAccounts = this.payeeAccounts.filter(p => !p.external);
      }

      this.v$.payeeAccount.$touch();

    },

    pickItem(event, prop) {
      //event.target.id is always "suggestion-xy", where xy is the id, so I need the substring from index 11
      const id = event.target.id.substring(11);

      if (id == -1) {
        //no items found
      }
      else if (id == 0) {
        //add new item
        //TODO - in the OrganismExternalPartyForm add a note that only an external party can be created here, internal parties (accountHolders) are created somewhere else
        this.$emit('addExternalParty');
      }
      else {
        this[prop] = this[`${prop}s`].find(p => p.id == id);
      }
    },

    // pickPayerAccount(event) {
    //   const clickedItem = event.target.textContent;
    //
    //   if (clickedItem === '+ Neu hinzufügen') {
    //     this.$emit('addExternalParty');
    //   }
    //   else {
    //     //event.target.id is always "suggestion-xy", where xy is the id, so I need the substring from index 11
    //     const id = event.target.id.substring(11);
    //     this.payerAccount = this.payerAccounts.find(p => p.id == id);
    //   }
    // },

    // pickPayerCostCenter(event) {
    //   const id = event.target.id.substring(11);
    //   this.payerCostCenter = this.payerCostCenters.find(p => p.id == id);
    // }
  },

  setup() {
    return {
      v$: useVuelidate(),
    };
  },

  validations() {
    const validation = copyService.copyObject(transactionValidation);

    if (this.payerAccount) {
      validation.payerCostCenter.payerCostCenterValidator = payerCostCenterValidator(this.payerAccount);
    }

    return validation;
    //return transactionValidation;
  },
};

</script>