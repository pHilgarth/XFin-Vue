<template>
  <MoleculeBudgetManagerCategory :category="transactionCategories[0]" :disabled="true" :hasErrors="freeBudgetErrors" :modelValue="freeBudget" :validation="v$.freeBudget"/>
  <template v-for="(category, index) in transactionCategories" :key="index">
    <MoleculeBudgetManagerCategory v-if="index > 0" :category="category" @amount-changed="calculateFreeBudget" :modelValue="category.balance"/>
  </template>
  <div class="row">
    <p class="col-8">&nbsp;</p>
    <p class="col-2 budget-manager__total">
      <span>Total:</span><span :class="{ 'negative': total < 0 }">{{ formatCurrency(total) }}</span>
    </p>
    <p class="col-2">
      <AtomButton class="btn xfin-button" text="Speichern" :disabled="saveDisabled" />
    </p>
  </div>
</template>

<script>
//import AtomBudgetManagerInput from '@/components/atoms/AtomBudgetManagerInput';
import AtomButton from "@/components/atoms/AtomButton";
import MoleculeBudgetManagerCategory from "@/components/molecules/MoleculeBudgetManagerCategory";
//import MoleculeInputText from "@/components/molecules/MoleculeInputText";

import { InternalTransactionService } from "@/services/internal-transaction-service";
import { NumberService } from "@/services/number-service";

import { freeBudgetValidator } from "@/validation/custom-validators";
import { useVuelidate } from "@vuelidate/core";

export default {
  beforeMount() {
    this.storeOriginalBalanceValues();
  },

  components: {
    //AtomBudgetManagerInput,
    AtomButton,
    //MoleculeInputText,
    MoleculeBudgetManagerCategory,
  },

  props: {
    bankAccount: { type: Object, required: true },
    transactionCategories: { type: Array, required: true },
  },

  computed: {
/*    minimalAmountString() {
      return NumberService.formatCurrency(this.minimalAmount);
    },*/

    budgetNegative() {
      return NumberService.parseFloat(this.freeBudget) < 0;
    },

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

      total: this.transactionCategories.reduce((a, b) => {
        return (
          NumberService.parseFloat(a.balance) +
          NumberService.parseFloat(b.balance)
        );
      }),

      minimalAmount:
        this.bankAccount.settings.balanceThreshold ||
        (!this.bankAccount.settings.allowsOverdraft ? 0 : null),
    };
  },

  methods: {
    calculateFreeBudget(value, category, dirty = true) {
      if (NumberService.parseFloat(value) !== category.originalBalance) {
        category.dirty = dirty;
        this.dirtyCategories.push(category);
        //free budget is calculated on every input, so I need to check how many decimals there are, if any
        let decimals = value.split(",")[1]?.length || 0;

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

        //TODO - here I have to validate the new budget - (minimum amount, no overdraft)
        //....

        console.log(this.total);
        category.balance = this.formatCurrency(value, false, decimals);
      }
      else { alert('fuck you' )}
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

    resetCategory(category) {
      this.calculateFreeBudget(category.originalBalance, category, false);
    },

    async saveCategory(category) {
      const amount =
        NumberService.parseFloat(category.balance) -
        NumberService.parseFloat(category.originalBalance);
      const currentDate = new Date().toISOString();

      const internalTransaction = {
        internalBankAccountId: category.bankAccountId,
        transactionCategoryId: category.id,
        dateString: currentDate,
        amount: amount,
      };

      const createdTransaction = await InternalTransactionService.create(
        internalTransaction
      );

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