<template>
  <!-- TODO - rework this component - it uses <p>-tags and one is even empty -->
  <!-- TODO - this component is only used inside config object (in component BudgetManager), passed to a collapsible component. maybe work with slots? -->
  <div class="organism-budget-list">
    <MoleculeBudgetManagerCategory  :category="transactionCategories[0]" :disabled="true" :hasErrors="freeBudgetErrors" :value="freeBudget"
                                    :validation="v$.freeBudget" />

    <template v-for="(category, index) in transactionCategories" :key="index">
      <MoleculeBudgetManagerCategory v-if="index > 0" :category="category" @amount-changed="calculateFreeBudget" @reset="resetCategory" :value="category.balance"/>
    </template>

    <div class="row">
      <p class="col-8">&nbsp;</p>
      <p class="col-2 organism-budget-list__total">
        <span>Total:</span><span :class="{ 'negative': total < 0 }">{{ formatCurrency(total) }}</span>
      </p>
      <p class="col-2">
        <AtomButton type="light" text="Speichern" :disabled="saveDisabled" @click="saveChanges" />
      </p>
    </div>
  </div>
</template>

<script>
import AtomButton from "@/components/atoms/shared/AtomButton";
import MoleculeBudgetManagerCategory from "@/components/molecules/MoleculeBudgetManagerCategory";

import { InternalTransactionService } from "@/services/internal-transaction-service";
import { NumberService } from "@/services/number-service";

import { freeBudgetValidator } from "@/validation/custom-validators";
import { useVuelidate } from "@vuelidate/core";

export default {
  beforeMount() {
    this.storeOriginalBalanceValues();
  },

  components: {
    AtomButton,
    MoleculeBudgetManagerCategory,
  },

  props: {
    bankAccount: { type: Object, required: true },
    transactionCategories: { type: Array, required: true },
  },

  computed: {
    // budgetNegative() {
    //   return NumberService.parseFloat(this.freeBudget) < 0;
    // },

    freeBudgetErrors() {
      return this.v$.freeBudget.$error;
    },

    saveDisabled() {
      return this.dirtyCategories.length === 0 || this.v$.freeBudget.$error;
    },
  },

  data() {
    return {
      freeBudget: this.transactionCategories[0].balance,
      dirtyCategories: [],

      //TODO - test if total is calculated correctly!
      total: this.transactionCategories.reduce((a, b) => {
        //this step is needed because initially a is an object with a property balance
        //but the return statement returns a number 
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
      for (let i = 0; i < this.transactionCategories.length; i++) {
        const category = this.transactionCategories[i];

        if (category.dirty) {
          const amount =
            NumberService.parseFloat(category.balance) -
            category.originalBalance;

          const currentDate = new Date().toISOString();

          const internalTransaction = {
            internalBankAccountId: category.bankAccountId,
            transactionCategoryId: category.id,
            dateString: currentDate,
            amount: amount,
          };

          const createdTransaction = await InternalTransactionService.create(internalTransaction);

          const counterPartTransaction = {
            internalBankAccountId: category.bankAccountId,
            transactionCategoryId: this.transactionCategories.find(
              (c) => c.name === "Nicht zugewiesen"
            ).id,
            dateString: currentDate,
            amount: amount * -1,
            transactionToken: createdTransaction.counterPartTransactionToken,
            counterPartTransactionToken: createdTransaction.transactionToken,
          };

          /*const createdCounterPartTransaction = */ await InternalTransactionService.create(
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
      this.transactionCategories.forEach((category) => {
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