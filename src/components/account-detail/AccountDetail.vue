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
       <OrganismCollapsible :config="configureCollapsible"/>
       <revenue-section :revenues="account.revenues" :proportionPreviousMonth="account.proportionPreviousMonth"></revenue-section>

       <budget-section :transactionCategories="transactionCategories"></budget-section>

      <expense-section :expenses="account.expenses"></expense-section>
    </section>
  </div>
</template>

<script>
import OrganismCollapsible from "@/components/organisms/OrganismCollapsible";

import BudgetSection from './budget-section/BudgetSection';
import ExpenseSection from './expense-section/ExpenseSection';
import RevenueSection from './revenue-section/RevenueSection';

import MonthSwitch from '@/components/_shared/month-switch/MonthSwitch';

import { InternalBankAccountService } from '@/services/internal-bank-account-service.js';
import { NumberService } from "@/services/number-service";
import { TransactionCategoryService } from '@/services/transaction-category-service.js';

export default {
  beforeMount() {
    const simpleBankAccount = false;
    this.getAccount(simpleBankAccount);

    this.getTransactionCategories();
  },

   components: {
     OrganismCollapsible,
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
    configureCollapsible() {
      return {
        collapsed: true,
        title: 'Einnahmen',
        content: {
          component: 'OrganismTable',
          props: {
            config: this.configureTable(),
          },
        },
      };
    },

    configureTable() {
      let rows = [];
      
      this.account.revenues.forEach(revenue => {
        const row = {
          fields: [
            {
              content: this.formatDate(revenue.date),
            },
            {
              content: revenue.counterParty,
            },
            {
              content: revenue.reference,
            },
            {
              content: this.formatCurrency(revenue.amount),
            },
          ],
        };

        rows.push(row);
      });

      if (this.account.revenues.length === 0) {
        rows.push({
          fields: [
            {
              content: 'Keine Einnahmen vorhanden!',
              props: {
                colspan: 4,
                class: "no-revenues",
              },
            },
          ],
        });
      }

      rows.push({
        fields: [
          {
            content: "Einnahmen gesamt",
            props: {
              colspan: 3,
            },
          },
          {
            content: this.getRevenuesSum(true),
          },
        ],
      });

      return {
        tableHead: {
          fields: [
            { content: "Datum" },
            { content: "Quelle" },
            { content: "Verwendungszweck" },
            { content: "Betrag" },
          ]
        },
        tableBody: {
          rows: rows,
        },
      };
    },

    formatCurrency(value) {
      return NumberService.formatCurrency(value);
    },

    formatDate(value) {
      return NumberService.formatDate(value);
    },


    async getAccount(simple, month) {
      const year = new Date().getFullYear();
      month = month !== undefined ? month : new Date().getMonth();

      this.account =  await InternalBankAccountService.getInternalBankAccount(this.$route.params.id, simple, year, month);
      this.accountNumber = this.account.accountNumber;
      this.loading = false;
    },

    async getTransactionCategories(month) {
      const year = new Date().getFullYear();
      month = month !== undefined ? month : new Date().getMonth();

      this.transactionCategories = await TransactionCategoryService.getTransactionCategoriesByAccount(this.$route.params.id, year, month);
    },

    getRevenuesSum(formatCurrency) {
      let revenuesTotal = 0;

      this.account.revenues.forEach((revenue) => {
        revenuesTotal += revenue.amount;
      });

      if (formatCurrency) {
        return this.formatCurrency(revenuesTotal);
      } else {
        return revenuesTotal;
      }
    },

    updateView(month) {
      this.getAccount(false, month);
      this.getTransactionCategories(month);
    }
  },
};
</script>