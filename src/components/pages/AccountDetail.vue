<template>
  <div class="account-detail">
    <h1 class="account-detail-headline">
      Detailansicht ({{ accountNumber }})
    </h1>
    <p class="dev-hint important">wenn kontointern umgebucht wird, und die Abgänge auf einer KS die Zugänge übersteigen, stehen negative Einnahmen dran - evtl. gibt es hier eine andere Lösung? <b>TODO</b></p>
    <p class="dev-hint important">negative Einnahmen sehen einfach komisch aus</p>
    <section class="loading" v-if="loading">
      <div>Daten werden geladen ...</div>
    </section>
    <section class="loading-error" v-else-if="!account">
      <div class="fetching-error">Fehler beim Laden des Kontos!</div>
    </section>
    <section class="account-detail-body" v-else>
       <MoleculeMonthSwitch @month-switched="updateView" />
       <TemplateRevenueSection :account="account" />
       <TemplateBudgetSection :transactionCategories="transactionCategories" />
       <TemplateExpenseSection :account="account" />
    </section>
  </div>
</template>

<script>
import TemplateBudgetSection from "@/components/templates/TemplateBudgetSection";
import TemplateExpenseSection from "@/components/templates/TemplateExpenseSection";
import TemplateRevenueSection from "@/components/templates/TemplateRevenueSection";

import MoleculeMonthSwitch from "@/components/molecules/MoleculeMonthSwitch";

import { InternalBankAccountService } from '@/services/internal-bank-account-service.js';
import { TransactionCategoryService } from '@/services/transaction-category-service.js';

export default {
  beforeMount() {
    const simpleBankAccount = false;
    this.getAccount(simpleBankAccount);

    this.getTransactionCategories();
  },

   components: {
     TemplateBudgetSection,
     TemplateExpenseSection,
     TemplateRevenueSection,
     MoleculeMonthSwitch,
   },

  data() {
    return {
      account: null,
      transactionCategories: [],
      loading: true,
      accountNumber: ''
    };
  },

  methods: {
    async getAccount(simple, month) {
      const year = new Date().getFullYear();
      month = month !== undefined ? month : new Date().getMonth();

      this.account =  await InternalBankAccountService.getById(this.$route.params.id, simple, year, month);
      this.accountNumber = this.account.accountNumber;
      this.loading = false;
    },

    async getTransactionCategories(month) {
      const year = new Date().getFullYear();
      month = month !== undefined ? month : new Date().getMonth();

      this.transactionCategories = await TransactionCategoryService.getTransactionCategoriesByAccount(this.$route.params.id, year, month);
    },

    updateView(month) {
      this.getAccount(false, month);
      this.getTransactionCategories(month);
    }
  },
};
</script>