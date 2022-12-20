<template>

</template>

<script>
//import AtomButton from '@/components/atoms/AtomButton';
//import AtomEditIcon from '@/components/atoms/AtomEditIcon';
import MoleculeInputText from '@/components/molecules/MoleculeInputText';

import { numberService } from '@/services/number-service';

import { recurringTransactionValidation } from '@/validation/validations';

import Datepicker from '@vuepic/vue-datepicker';

import { useVuelidate } from "@vuelidate/core";

export default {
  props: {
    recurringTransaction: { type: Object, required: true },
  },
  
  components: {
    //AtomButton,
    //AtomEditIcon,
    MoleculeInputText,
    Datepicker,
  },

  computed: {
    allowEditFrom() {
      return Date.parse(this.recurringTransaction.startDate) > new Date();
    },
  },

  watch: {
    startDate() {
      //watcher gets called twice ... don't know why, but second time "toISOString()" throws an error
      if (typeof this.startDate === 'object') {
        this.startDate = this.startDate.toISOString();
      }
    },

    endDate() {
      //watcher gets called twice ... don't know why, but second time "toISOString()" throws an error
      if (typeof this.endDate === 'object') {
        this.endDate = this.endDate.toISOString();
      }
    }
  },

  data() {
    return {
      amount: this.recurringTransaction.amount,
      dayOfMonth: this.recurringTransaction.dayOfMonth,
      startDate: this.formatDate(this.recurringTransaction.startDate),
      reference: this.recurringTransaction.reference,
      endDate: this.formatDate(this.recurringTransaction.endDate)
    };
  },

  methods: {
    formatDate(value) {
      const date = numberService.formatDate(value);
      //return only month and year, separated by /
      return date.slice(3).replaceAll('.', '/');
    },

    getPayeeString() {
      return `${this.recurringTransaction.targetBankAccount.accountHolderName} (${this.recurringTransaction.targetCostCenter.name})`;

      // let result = this.recurringTransaction.transactionType === 'Revenue'
      //     ? this.recurringTransaction.responsibleAccountHolder
      //     : this.recurringTransaction.counterParty.slice(4);
      //
      // result += ` - ${this.recurringTransaction.targetCostCenter.name}`;
      //
      // return result;
    },

    getPayerString() {
      return `${this.recurringTransaction.sourceBankAccount.accountHolderName} (${this.recurringTransaction.sourceCostCenter.name})`;

      // let result = this.recurringTransaction.transactionType !== 'Revenue'
      //     ? this.recurringTransaction.responsibleAccountHolder
      //     : this.recurringTransaction.counterParty.slice(4);
      //
      // result += ` - ${this.recurringTransaction.sourceCostCenter.name}`
      //
      // return result
    },
  },

  setup() {
    return {
      v$: useVuelidate(),
    };
  },

  validations() {
    return recurringTransactionValidation;
  },
}
</script>

<style>
@import '~@vuepic/vue-datepicker/dist/main.css';
</style>