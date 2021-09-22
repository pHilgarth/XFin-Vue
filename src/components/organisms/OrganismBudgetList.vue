<template>
    <div class="xfin-card budget-manager">
        <div class="xfin-card__content col-8">
            <span>{{ transactionCategories[0].name }}</span>
        </div>
        <div class="xfin-card__content col-2">
            <input type="text" class="text-right" v-model="freeBudget" disabled :class="{ 'negative': budgetNegative }"/>
        </div>
    </div>
  <template v-for="(category, index) in transactionCategories" :key="index">
    <div v-if="index > 0" class="xfin-card budget-manager" :class="{ 'changed': category.dirty }">
        <div class="xfin-card__content col-8">
            <span>{{ category.name }}</span>
        </div>
        <div class="xfin-card__content col-2">
            <AtomBudgetManagerInput :valueProp="category.balance" @amount-changed="calculateFreeBudget($event.value, category)" />
        </div>
        <div class="xfin-card__content col-2">
            <i v-if="category.dirty" class="bi bi-arrow-counterclockwise reset" title="Zurücksetzen" @click="resetCategory(category)"></i>
            <i v-if="category.dirty" class="bi bi-check-circle save" title="Änderung speichern" @click="saveCategory(category)"></i>
        </div>
    </div>
  </template>
  <div class="row">
    <p class="col-8">&nbsp;</p>
    <p class="col-2 budget-manager__total">
      <span>Total:</span><span :class="{ 'negative': total < 0 }">{{ formatCurrency(total) }}</span>
      </p>
  </div>
</template>

<script>
import AtomBudgetManagerInput from "@/components/atoms/AtomBudgetManagerInput";

import { InternalTransactionService } from "@/services/internal-transaction-service";
import { NumberService } from "@/services/number-service";

export default {
  beforeMount() {
    this.storeOriginalBalanceValues();
  },

  components: {
    AtomBudgetManagerInput,
  },

  props: {
    transactionCategories: {
      type: Array,
      required: true,
    },
  },

  computed: {
    budgetNegative() {
      return this.parseFloat(this.freeBudget) < 0;
    },
  },

  data() {
      return {
          freeBudget: this.transactionCategories[0].balance,
          total: this.transactionCategories.reduce(
            (a, b) =>{ return this.parseFloat(a.balance) + this.parseFloat(b.balance) }),
      };
  },

  methods: {
    calculateFreeBudget(value, category, dirty = true) {
        category.dirty = dirty;
        let decimals = value.split(',')[1]?.length || 0;

        const numValue = value !== ''
          ? this.parseFloat(value)
          : 0;

        const numCategoryValue = category.balance !== ''
          ? this.parseFloat(category.balance)
          : 0;

        const numFreeBudget = this.parseFloat(this.freeBudget);

        this.freeBudget = this.formatCurrency(numFreeBudget + (numCategoryValue - numValue), false);
        category.balance = this.formatCurrency(value, false, decimals);
    },

    configureInput(category) {
      return {
        disabled: category.name === "Nicht zugewiesen" ? true : false,
        value: NumberService.formatCurrency(category.balance, false),
      };
    },

    formatCurrency(value, includeCurrency = true, decimals = 2) {
        if (!includeCurrency) {
          let sliceAmount = 2 - decimals;
          sliceAmount = sliceAmount === 2 && value.toString().indexOf(',') === -1 ? sliceAmount + 1 : sliceAmount;

          value = typeof value === "number" ? value : this.parseFloat(value);

          let result = NumberService.formatCurrency(value, includeCurrency);
          result = decimals < 2 ? result.slice(0, sliceAmount * -1) : result;

          return result;
        }

        return NumberService.formatCurrency(value, includeCurrency)
    },

    parseFloat(value) {
      return parseFloat(value.replaceAll(".", "").replace(",", "."));
    },

    resetCategory(category) {
      this.calculateFreeBudget(category.originalBalance, category, false);
    },

    async saveCategory(category) {
      const amount = this.parseFloat(category.balance) - this.parseFloat(category.originalBalance)
      const currentDate = new Date().toISOString();

      const internalTransaction = {
        internalBankAccountId: category.bankAccountId,
        transactionCategoryId: category.id,
        dateString: currentDate,
        amount: amount,
      };
      
      const createdTransaction = await InternalTransactionService.createInternalTransaction(internalTransaction);

      const counterPartTransaction = {
        internalBankAccountId: category.bankAccountId,
        transactionCategoryId: this.transactionCategories.find(c => c.name === "Nicht zugewiesen").id,
        dateString: currentDate,
        amount: amount * -1,
        transactionToken: createdTransaction.counterPartTransactionToken,
        counterPartTransactionToken: createdTransaction.transactionToken,
      };

      /*const createdCounterPartTransaction = */await InternalTransactionService.createInternalTransaction(counterPartTransaction);

      category.dirty = false;
      category.originalBalance = category.balance;
    },

    storeOriginalBalanceValues() {
      this.transactionCategories.forEach(category => {
        category.originalBalance = category.balance;
      });
    }
  },
};
</script>