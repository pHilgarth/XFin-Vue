<template>
  <div class="organism-loan-form">
    <div class="organism-loan-form__inner">
      <AtomHeadline tag="h1" text="Darlehen erstellen" />
      <form class="organism-loan-form__form">
        <MoleculeInputSelect class="pb-5 w-100" field="accountRole" v-model="accountRole" label="Rolle dieses Accounts"
                             :options="accountRoleOptions" :hasErrors="v$.accountRole.$error"
                             :validation="v$.accountRole" @blur="v$.accountRole.$touch()" />

        <MoleculeInputAutoSuggest v-if="accountRole !== 'choose'" class="pb-5 w-100" field="counter-party" v-model="counterParty"
                                  :label="accountRole === 'creditor' ? 'Schuldner' : 'Gläubiger'" :items="counterParties.map(e => e.name)"
                                  :validation="v$.counterParty" :hasErrors="v$.counterParty.$error" :errorMessageParams="errorMessageParams"
                                  @blur="v$.counterParty.$touch()" @itemPicked="pickCounterParty" />

        <MoleculeInputSelect v-if="accountRole === 'debitor'" class="pb-5 w-100" field="costCenter" v-model="costCenterId" label="Kostenstelle"
                             :options="[{ value: -1, label: '(bitte wählen)' }, ...costCenters.map(c => { return { value: c.id, label: c.name } })]"
                             :validation="v$.costCenterId" :hasErrors="v$.costCenterId.$error" @blur="v$.costCenterId.$touch()" />

        <MoleculeInputText class="pb-5 w-100" field="reference" label="Verwendungszweck" v-model="reference" :validation="v$.reference"
                           :hasErrors="v$.reference.$error" @blur="v$.reference.$touch()" />

        <MoleculeInputText class="pb-5 col-md-5" field="amount" label="Betrag" v-model="amount" :validation="v$.amount"
                           :hasErrors="v$.amount.$error" @blur="v$.amount.$touch()" />

        <MoleculeInputText class="pb-5 col-md-5" field="life" label="Laufzeit in Monaten" v-model="life" :validation="v$.life"
                           :hasErrors="v$.life.$error" @blur="v$.life.$touch()" />

        <MoleculeInputText class="pb-5 col-md-5" field="rate-of-interest" label="Zinssatz" v-model="rateOfInterest"
                           :validation="v$.rateOfInterest" :hasErrors="v$.rateOfInterest.$error" @blur="v$.rateOfInterest.$touch()" />

        <MoleculeInputText class="pb-5 col-md-5" field="monthly-installment" label="Monatsrate" v-model="monthlyInstallment"
                           :validation="v$.monthlyInstallment" :hasErrors="v$.monthlyInstallment.$error" @blur="v$.monthlyInstallment.$touch()" />

        <div>
          <AtomButton type="primary" text="Speichern" :disabled="v$.$silentErrors.length > 0" @click="save" />
          <AtomButton type="cancel" text="Abbrechen" @click.prevent="$emit('cancel')" />
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { useVuelidate } from "@vuelidate/core";

import AtomButton from '@/components/atoms/AtomButton';
import AtomHeadline from '@/components/atoms/AtomHeadline';
//import AtomParagraph from '@/components/atoms/AtomParagraph';
import MoleculeInputAutoSuggest from '@/components/molecules/MoleculeInputAutoSuggest';
import MoleculeInputSelect from '@/components/molecules/MoleculeInputSelect';
import MoleculeInputText from '@/components/molecules/MoleculeInputText';

import { copyService } from '@/services/copy-service';
import { loanValidation } from '@/validation/validations';
import { costCenterIdValidator }from '@/validation/custom-validators';

export default {
  components: {
    AtomButton,
    AtomHeadline,
    //AtomParagraph,
    MoleculeInputAutoSuggest,
    MoleculeInputSelect,
    MoleculeInputText,
  },

  props: {
    costCenters: { type: Array, required: true },
    counterParties: { type: Array, required: true },
  },

  computed: {
    errorMessageParams() {
      return { counterPartyType: this.accountRole === 'creditor' ? 'Schuldner' : 'Gläubgier' };
    },
  },

  data() {
    return {
      accountRole: 'choose',
      amount: null,
      costCenterId: -1,
      counterParty: null,
      life: null,
      monthlyInstallment: null,
      rateOfInterest: null,
      reference: null,

      accountRoleOptions: [
        { value: 'choose', label: '(bitte wählen)', disabled: true },
        { value: 'creditor', label: 'Gläubiger' },
        { value: 'debitor', label: 'Schuldner' },
      ],
    };
  },

  methods: {
    pickCounterParty() {
      console.log('pickCounterParty');
    },

    save() {
      console.log('save');
    }
  },

  setup() {
    return {
      v$: useVuelidate(),
    };
  },

  validations() {
    //it does not work, if I simply assign transactionValidation to validation, it has to be a separate object
    let validation = copyService.copyObject(loanValidation);

     if (this.accountRole === 'debitor') {
       validation.costCenterId = { costCenterIdValidator }
     }

    return validation;
  },
}
</script>