<template>
  <!-- TODO - see paragraph -->
<!--  <p style="color:red">ich muss hier noch die Möglichkeit für ein Start- und Enddatum anbieten, vor allem bei nicht-monatlich-wiederkehrenden Transaktionen muss hier der Startmonat auswählbar sein</p>-->

  <OrganismTransactionForm
      :costCenters="costCenters"
      :payerAccounts="payerAccounts"
      :payeeAccounts="payeeAccounts"
      :initialPayeeAccount="payeeAccount"
      :initialPayerAccount="payerAccount"
      :transactionType="transactionType"
      @addExternalParty="showExternalPartyForm = true"
      @updateTransactionType="updateTransactionType"
      @saveTransaction="saveTransaction"
      @updatePayeeAccounts="updatePayeeAccounts"
  />
  <div class="organism-recurring-transaction">


  </div>
</template>

<script>
//import MoleculeInputAutoSuggest from "@/components/molecules/MoleculeInputAutoSuggest";
//import MoleculeInputText from "@/components/molecules/MoleculeInputText";
import OrganismTransactionForm from "./OrganismTransactionForm";

import { dayOfMonthValidator } from '@/validation/custom-validators';

//third party imports
//import Datepicker from "@vuepic/vue-datepicker";

import { useVuelidate } from "@vuelidate/core";

import { required } from "@vuelidate/validators";

export default {
  components: {
    //MoleculeInputAutoSuggest,
    //MoleculeInputText,
    OrganismTransactionForm,
    //Datepicker,
  },

  data() {
    return {
      costCenters: null,
      cycleItem: null,
      cycleItems: [
        { id: 1, label: 'monatlich' },
        { id: 3, label: 'vierteljährlich' },
        { id: 6, label: 'halbjährlich' },
        { id: 12, label: 'jährlich' },
      ],
      dayOfMonth: null,
      endDate: null,
      recurringTransaction: false,
      startDate: null,
    };
  },

  methods: {
    onBlurCycleItem(event) {
      if (this.cycleItem?.label !== event.target.value) {
        this.cycleItem = null;
      }

      this.v$.cycleItem.$touch();
    },

    //TODO - do I need this? I have v-model...?
    pickCycleItem(event) {
      this.cycleItem = this.cycleItems.find(c => c.id == event.id);
    }
  },

  setup() {
    return {
      v$: useVuelidate(),
    };
  },

  validations() {
    return {
      cycleItem: { required },
      dayOfMonth: { dayOfMonthValidator },
      endDate: { required },
      startDate: { required },
    }
  },

  watch: {
    dayOfMonth() {
      this.v$.dayOfMonth.$touch();
    },
  }
}
</script>