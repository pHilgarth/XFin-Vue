<template>
  <div class="account-detail">
    <h1 class="account-detail-headline">
      Detailansicht ({{ accountNumber }})
    </h1>
    <section class="loading" v-if="loading">
      <div>Daten werden geladen ...</div>
    </section>
    <section class="loading-error" v-else-if="!account">
      <div class="fetching-error">Fehler beim Laden des Kontos!</div>
    </section>
    <section class="account-detail-body" v-else>
      <month-switch @month-switched="updateView"></month-switch>
      <revenue-section :revenues="account.revenues" :proportionPreviousMonth="account.proportionPreviousMonth"></revenue-section>

      <budget-section :transactionCategories="transactionCategories"></budget-section>

      <expense-section :expenses="account.expenses"></expense-section> 
    </section>
  </div>
</template>

<script>
 import BudgetSection from './budget-section/BudgetSection';
 import ExpenseSection from './expense-section/ExpenseSection';
 import RevenueSection from './revenue-section/RevenueSection';

import MonthSwitch from '@/components/_shared/month-switch/MonthSwitch';

import { BankAccountService } from '@/services/bank-account-service.js';
import { TransactionCategoryService } from '@/services/transaction-category-service.js';
import { NumberService } from '@/services/number-service.js';

export default {
  beforeMount() {
    const simpleBankAccount = false;
    this.getAccount(simpleBankAccount);

    this.getTransactionCategories();
  },

  components: {
    BudgetSection,
    ExpenseSection,
    RevenueSection,
    MonthSwitch
  },

  data() {
    return {
      account: null,
      transactionCategories: null,
      loading: true,
      accountNumber: ''
    };
  },

  methods: {
    formatCurrency(value) {
      return NumberService.formatCurrency(value);
    },

    async getAccount(simple, month) {
      const year = new Date().getFullYear();
      month = month !== undefined ? month : new Date().getMonth();

      this.account =  await BankAccountService.getBankAccount(this.$route.params.id, simple, year, month);
      this.accountNumber = this.account.accountNumber;
      this.loading = false;
    },

    async getTransactionCategories(month) {
      const year = new Date().getFullYear();
      month = month !== undefined ? month : new Date().getMonth();

      this.transactionCategories = await TransactionCategoryService.getTransactionCategories(this.$route.params.id, year, month);
    },

    updateView(month) {
      this.getAccount(false, month);
      this.getTransactionCategories(month);
    }
  },
};
</script>