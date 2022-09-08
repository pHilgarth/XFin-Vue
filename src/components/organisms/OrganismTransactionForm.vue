<template>
  <form class="organism-transaction-form">
    <div class="organism-transaction-form__payer">
      <AtomHeadline class="organism-transaction-form__headline" tag="h5" text="Zahlungspflichtiger" />
      <!-- TODO - check if v-model accountId can be removed -->
      <div class="col-6 pe-3">
        <MoleculeInputAutoSuggest field="payer-account" v-model="payerAccount" label="Konto" :items="payerAccounts"
                                  :allowNewItems="true" :validation="v$.payerAccount" :hasErrors="v$.payerAccount.$error"
                                  @itemPicked="pickPayerAccount" />
      </div>

      <div class="col-6 ps-3">
        <MoleculeInputAutoSuggest field="payer-cost-center" :selectedItem="payerCostCenter" label="Kostenstelle" :items="payerCostCenters"
                                  :validation="v$.payerCostCenter" :hasErrors="v$.payerCostCenter.$error"
                                  @itemPicked="pickPayerCostCenter" />
<!--        <MoleculeInputSelect class="pb-5" field="payerCostCenter" v-model="payerCostCenterId" label="Kostenstelle"-->
<!--                             :options="payerCostCenters.map(c => { return { value: c.id, label: c.name } })" />-->
      </div>
    </div>

<!--    <div class="organism-transaction-form__payee">-->
<!--      <AtomHeadline class="organism-transaction-form__headline" tag="h5" text="Zahlungsempfänger" />-->
<!--      <div class="col-md-6 pe-3">-->
<!--        <MoleculeInputSelect class="organism-transaction-form__payee-account pb-5" field="payee-account" label="Konto" v-model="payeeAccountId" />-->
<!--        &lt;!&ndash;                         :options="[{ value: bankAccount.id, label: `${bankAccount.accountNumber}`}]" />&ndash;&gt;-->
<!--      </div>-->
<!--      <div class="col-md-6 ps-3">-->
<!--        <MoleculeInputSelect class="pb-5" field="payeeCostCenter" v-model="payeeCostCenterId" label="Kostenstelle" />-->
<!--        &lt;!&ndash;                         :options="costCenters.map(c => { return { value: c.id, label: c.name } })" />&ndash;&gt;-->
<!--      </div>-->
<!--    </div>-->

<!--    <div class="organism-transaction-form__details">-->
<!--      <AtomHeadline class="organism-transaction-form__headline" tag="h4" text="Details" />-->

<!--      <div class="col-md-6 pe-3">-->
<!--        <MoleculeInputSelect class="pb-5" :options="transactionTypes" field="transactionType" v-model="transactionType" label="Typ" />-->
<!--      </div>-->

<!--      <div v-if="!transactionType" class="col-md-6 ps-3">-->
<!--        <MoleculeInputSelect class="pb-5" :options="transactionTypes" field="transactionType" v-model="transactionType" label="Typ" />-->
<!--      </div>-->

<!--      <div class="col-md-6 pe-3">-->
<!--        <MoleculeInputText class="pb-5" field="reference" v-model="reference" label="Verwendungszweck" />-->
<!--      </div>-->
<!--      <div class="col-md-6 ps-3">-->
<!--          <MoleculeInputText class="pb-5" field="amount" v-model="amount" label="Betrag" />-->
<!--      </div>-->
<!--    </div>-->


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
//import MoleculeInputText from '@/components/molecules/MoleculeInputText';

import { copyService } from '@/services/copy-service';
import { transactionValidation } from '@/validation/validations';

import { useVuelidate } from "@vuelidate/core";

export default {
  components: {
    //AtomButton,
    AtomHeadline,
    MoleculeInputAutoSuggest,
    //MoleculeInputSelect,
    //MoleculeInputText,
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
      payeeAccounts: copyService.copyArray(this.bankAccounts).map(p => { return { id: p.id, label: `${p.accountHolderName} (${p.iban})`}}),
      payeeCostCenter: null,
      payeeCostCenters: copyService.copyArray(this.costCenters).map(p => { return { id: p.id, label: p.name}}),
      payerAccount: this.initialPayerAccount || null,
      payerAccounts: copyService.copyArray(this.bankAccounts).map(p => { return { id: p.id, label: `${p.accountHolderName} (${p.iban})`}}),
      payerCostCenter: null,
      payerCostCenters: copyService.copyArray(this.costCenters).map(p => { return { id: p.id, label: p.name}}),
      reference: null,
    }
  },

  methods: {
    pickPayerAccount(event) {
      const clickedItem = event.target.textContent;

      if (clickedItem === '+ Neu hinzufügen') {
        this.$emit('addExternalParty');
      }
      else {
        //event.target.id is always "suggestion-xy", where xy is the id, so I need the substring from index 11
        const id = event.target.id.substring(11);
        this.payerAccount = this.payerAccounts.find(p => p.id == id);
      }
    },

    pickPayerCostCenter(event) {
      const id = event.target.id.substring(11);
      this.payerCostCenter = this.payerCostCenters.find(p => p.id == id);
    }
  },

  setup() {
    return {
      v$: useVuelidate(),
    };
  },

  validations() {
    return transactionValidation;
  },
};

</script>