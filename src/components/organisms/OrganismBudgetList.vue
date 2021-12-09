<template>
    <div class="xfin-card budget-manager__category">
        <div class="xfin-card__content col-8">
            <span>{{ transactionCategories[0].name }}</span>
        </div>
        <div class="xfin-card__content col-2">
            <input type="text" class="text-right" v-model="freeBudget" disabled :class="{ 'negative': budgetNegative }"/>
        </div>
    </div>
  <template v-for="(category, index) in transactionCategories" :key="index">
    <MoleculeBudgetManagerCategory v-if="index > 0" :category="category" @amount-changed="calculateFreeBudget" />
  </template>
  <div class="row">
    <p class="col-8">&nbsp;</p>
    <p class="col-2 budget-manager__total">
      <span>Total:</span><span :class="{ 'negative': total < 0 }">{{ formatCurrency(total) }}</span>
    </p>
    <p class="col-2">
      <span class="btn xfin-button">Speichern</span>
    </p>
  </div>
  <div>{{ v$ }}</div>
</template>

<script>
//import AtomBudgetManagerInput from "@/components/atoms/AtomBudgetManagerInput";
import MoleculeBudgetManagerCategory from "@/components/molecules/MoleculeBudgetManagerCategory";

import { InternalTransactionService } from "@/services/internal-transaction-service";
import { NumberService } from "@/services/number-service";

import { freeBudgetValidator } from '@/validation/custom-validators';
import {useVuelidate} from "@vuelidate/core";

export default {
  beforeMount() {
    this.storeOriginalBalanceValues();
  },

  components: {
    //AtomBudgetManagerInput,
    MoleculeBudgetManagerCategory,
  },

  props: {
    bankAccount: { type: Object, required: true },
    transactionCategories: { type: Array, required: true },
  },

  computed: {
    budgetNegative() {
      return NumberService.parseFloat(this.freeBudget) < 0;
    },
  },

  data() {
      return {
          freeBudget: this.transactionCategories[0].balance,
          total: this.transactionCategories.reduce(
            (a, b) =>{ return NumberService.parseFloat(a.balance) + NumberService.parseFloat(b.balance) }),
      };
  },

  methods: {
    calculateFreeBudget(value, category, dirty = true) {
        category.dirty = dirty;
        //free budget is calculated on every input, so I need to check how many decimals there are, if any
        let decimals = value.split(',')[1]?.length || 0;

        //string to number on value
        const numValue = value !== ''
          ? NumberService.parseFloat(value)
          : 0;

        //string to number on categoryBalance
        const numCategoryBalance = category.balance !== ''
          ? NumberService.parseFloat(category.balance)
          : 0;

        //string to number on current free budget
        const numFreeBudget = NumberService.parseFloat(this.freeBudget);

        //calculate new free budget
        this.freeBudget = this.formatCurrency(numFreeBudget + (numCategoryBalance - numValue), false);

        if (!this.bankAccount.settings.allowsOverdraft && NumberService.parseFloat(this.freeBudget) < 0) {
          console.log('no overdraft allowed!');
        }

        //TODO - here I have to validate the new budget - (minimum amount, no overdraft)
        //....


        
        console.log(this.total);
        category.balance = this.formatCurrency(value, false, decimals);
    },

    formatCurrency(value, includeCurrency = true, decimals = 2) {
        if (!includeCurrency) {
          let sliceAmount = 2 - decimals;
          sliceAmount = sliceAmount === 2 && value.toString().indexOf(',') === -1 ? sliceAmount + 1 : sliceAmount;

          value = typeof value === "number" ? value : NumberService.parseFloat(value);

          let result = NumberService.formatCurrency(value, includeCurrency);
          result = decimals < 2 ? result.slice(0, sliceAmount * -1) : result;

          return result;
        }

        return NumberService.formatCurrency(value, includeCurrency)
    },

    resetCategory(category) {
      this.calculateFreeBudget(category.originalBalance, category, false);
    },

    async saveCategory(category) {
      const amount = NumberService.parseFloat(category.balance) - NumberService.parseFloat(category.originalBalance)
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
        transactionCategoryId: this.transactionCategories.find(c => c.name === "Nicht zugewiesen").id,
        dateString: currentDate,
        amount: amount * -1,
        transactionToken: createdTransaction.counterPartTransactionToken,
        counterPartTransactionToken: createdTransaction.transactionToken,
      };

      /*const createdCounterPartTransaction = */await InternalTransactionService.create(counterPartTransaction);

      category.dirty = false;
      category.originalBalance = category.balance;
    },

    storeOriginalBalanceValues() {
      this.transactionCategories.forEach(category => {
        category.originalBalance = category.balance;
      });
    }
  },

  setup() {
    return {
      v$: useVuelidate(),
    };
  },

  validations() {
    return {
      freeBudget: { freeBudget: freeBudgetValidator(this.minimalAmount) }
    }
  },
};
</script>