<template>
  <div class="account-detail">
    <h1 class="account-detail-headline">
      Detailansicht ({{ $route.params.id }})
    </h1>
    <section class="loading" v-if="loading">
      <div>Daten werden geladen ...</div>
    </section>
    <section class="loading-error" v-else-if="!account">
      <div class="fetching-error">Fehler beim Laden der Kontoinhaber!</div>
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

import MonthSwitch from '../_shared/month-switch/MonthSwitch';

import { BankAccountService } from '../../services/bank-account-service.js';
import { TransactionCategoryService } from '../../services/transaction-category-service.js';
import { NumberService } from '../../services/number-service.js';

export default {
  beforeMount() {
    const simpleBankAccount = false;
    this.getAccount(simpleBankAccount);

    this.getTransactionCategories(false);
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
      loading: true
    };
  },

  methods: {
    formatCurrency(value) {
      return NumberService.formatCurrency(value);
    },

    async getAccount(simple, month) {
      const year = new Date().getFullYear();
      month = month !== undefined ? month : new Date().getMonth();

      this.account =  await BankAccountService.getBankAccount(this.$route.params.accountNumber, simple, year, month);
      console.log(this.account);
      this.loading = false;
    },

    async getTransactionCategories(simple, month) {
      const year = new Date().getFullYear();
      month = month !== undefined ? month : new Date().getMonth();

      this.transactionCategories = await TransactionCategoryService.getTransactionCategories(this.$route.params.accountNumber, simple, year, month);
    },

    updateExpensesTable(month) {
      console.log(month);
      //this.account.expenses = BankAccountService.getExpenses(this.$route.params.accountNumber, month);
    },

    updateRevenuesTable(month) {
      console.log(month);
      // // getRevenues returns an obj: { revenues: Array, proportionPrevMonth: Number}
      // const helperObj = AccountHolderService.getRevenues(this.$route.params.accountNumber, month);

      // // then we assign revenues and proportionPrevMonth to the account
      // this.account.revenues = helperObj['revenues'];
      // this.account.proportionPrevMonth = helperObj['proportionPrevMonth'];
    },

    updateView(month) {
      this.getAccount(true, month);
      this.getTransactionCategories(false, month);
      //this.updateRevenuesTable(month);
    }
  },
};
</script>