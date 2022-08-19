<template>
  <!-- TODO - this component is only used inside config object (in component BudgetManager), passed to a collapsible component. maybe work with slots? -->
  <div class="organism-budget-list">
    <MoleculeBudgetManagerCategory  :category="costCenters[0]" :disabled="true" :hasErrors="freeBudgetErrors" :value="freeBudget"
                                    :validation="v$.freeBudget" />

    <template v-for="(category, index) in costCenters" :key="index">
      <MoleculeBudgetManagerCategory v-if="index > 0" :category="category" @amount-changed="calculateFreeBudget" @reset="resetCategory" :value="category.balance"/>
    </template>

    <div class="organism-budget-list__total">
      <AtomSpan text="Total:" class="col-1" />
      <AtomSpan :class="`organism-budget-list__total__value col-1 ${ total < 0 ? 'negative' : '' }`" :text="formatCurrency(total)" />
      <div class="col-2 organism-budget-list__total__button">
        <AtomButton type="light" text="Speichern" :disabled="saveDisabled" @click="saveChanges" />
      </div>
    </div>
  </div>
</template>

<script>
import AtomButton from '@/components/atoms/AtomButton';
import AtomSpan from '@/components/atoms/AtomSpan';

import MoleculeBudgetManagerCategory from "@/components/molecules/MoleculeBudgetManagerCategory";

import { TransactionService } from "@/services/transaction-service";
import { NumberService } from "@/services/number-service";

import { freeBudgetValidator } from "@/validation/custom-validators";
import { useVuelidate } from "@vuelidate/core";

export default {
  beforeMount() {
    this.storeOriginalBalanceValues();
  },

  components: {
    AtomButton,
    AtomSpan,
    MoleculeBudgetManagerCategory,
  },

  props: {
    bankAccount: { type: Object, required: true },
    costCenters: { type: Array, required: true },
  },

  computed: {
    freeBudgetErrors() {
      return this.v$.freeBudget.$error;
    },

    saveDisabled() {
      return this.dirtyCategories.length === 0 || this.v$.freeBudget.$error;
    },
  },

  data() {
    return {
      freeBudget: this.costCenters[0].balance,
      dirtyCategories: [],

      //TODO - test if total is calculated correctly!
      total: this.costCenters.reduce((a, b) => {
        //initially a is an object with a property balance but the return statement returns a number
        let aValue = a.balance || NumberService.amountToString(a);

        return (
          NumberService.parseFloat(aValue) +
          NumberService.parseFloat(b.balance)
        );
      }),
    };
  },

  methods: {
    calculateFreeBudget(value, category, dirty = true) {      
      if (NumberService.parseFloat(value) !== category.originalBalance) {
        category.dirty = dirty;
        
        if (!this.dirtyCategories.find(c => c.id === category.id)) {
          this.dirtyCategories.push(category);
        }
      }
      else {
        category.dirty = false;
        const index = this.dirtyCategories.findIndex(c => c.id === category.id);
        this.dirtyCategories.splice(index, 1);
      }

      //TODO - do I need this? Test the calculation when allocationg budget
      //free budget is calculated on every input, so I need to check how many decimals there are, if any
      //let decimals = value.split(",")[1]?.length || 0;

      //string to number on value
      const numValue = value !== "" ? NumberService.parseFloat(value) : 0;

      //string to number on categoryBalance
      const numCategoryBalance =
        category.balance !== ""
          ? NumberService.parseFloat(category.balance)
          : 0;

      //string to number on current free budget
      const numFreeBudget = NumberService.parseFloat(this.freeBudget);

      //calculate new free budget
      this.freeBudget = this.formatCurrency(
        numFreeBudget + (numCategoryBalance - numValue),
        false
      );
      this.v$.freeBudget.$touch();
      //category.balance = this.formatCurrency(value, false, decimals);
      category.balance = value;
    },

    formatCurrency(value, includeCurrency = true, decimals = 2) {
      if (!includeCurrency) {
        let sliceAmount = 2 - decimals;
        sliceAmount =
          sliceAmount === 2 && value.toString().indexOf(",") === -1
            ? sliceAmount + 1
            : sliceAmount;

        value =
          typeof value === "number" ? value : NumberService.parseFloat(value);

        let result = NumberService.formatCurrency(value, includeCurrency);
        result = decimals < 2 ? result.slice(0, sliceAmount * -1) : result;

        return result;
      }

      return NumberService.formatCurrency(value, includeCurrency);
    },

//TODO - implement category resetting
    resetCategory(category) {
      this.calculateFreeBudget(this.formatCurrency(category.originalBalance, false), category, false);
    },

    async saveChanges() {
      for (let i = 0; i < this.costCenters.length; i++) {
        const category = this.costCenters[i];

        if (category.dirty) {
          const amount =
            NumberService.parseFloat(category.balance) -
            category.originalBalance;

          const currentDate = new Date().toISOString();

          const transaction = {
            internalBankAccountId: category.bankAccountId,
            costCenterId: category.id,
            dateString: currentDate,
            amount: amount,
          };

          const createdTransaction = await TransactionService.create(transaction);

          const counterPartTransaction = {
            internalBankAccountId: category.bankAccountId,
            costCenterId: this.costCenters.find(
              (c) => c.name === "Nicht zugewiesen"
            ).id,
            dateString: currentDate,
            amount: amount * -1,
            transactionToken: createdTransaction.counterPartTransactionToken,
            counterPartTransactionToken: createdTransaction.transactionToken,
          };

          /*const createdCounterPartTransaction = */ await TransactionService.create(
            counterPartTransaction
          );

          category.dirty = false;
          category.originalBalance = category.balance;

          const index = this.dirtyCategories.findIndex(c => c.id === category.id);
          this.dirtyCategories.splice(index, 1);
        }
      }
    },

    storeOriginalBalanceValues() {
      this.costCenters.forEach((category) => {
        category.originalBalance = NumberService.parseFloat(category.balance);
      });
    },
  },

  setup() {
    return {
      v$: useVuelidate(),
    };
  },

  validations() {
    return {
      freeBudget: { freeBudgetValidator },
    };
  },
};
</script>