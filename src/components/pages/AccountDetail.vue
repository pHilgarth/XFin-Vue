<template>
  <div class="account-detail">
    <h1 class="account-detail-headline">
      Detailansicht ({{ accountNumber }})
    </h1>
    <p class="dev-hint important">Einnahmen stimmen hier (macbook) bei zweiter KS noch nicht, die Umbuchung ist als Einnahme aufgeführt</p>
    <MoleculeLoading v-if="!dataLoaded" :loadingError="loadingError" errorMessage="Fehler beim Laden der Daten!" />
    <section class="account-detail-body" v-else>
       <MoleculeMonthSwitch @month-switched="updateView" />
        <OrganismRevenues :account="account" />
       <!-- TODO - not all entries are visible - the height of the collapsible is too low, the last entries are cut off-->
       <OrganismBudget :transactionCategories="transactionCategories" />
       <OrganismExpenses :account="account" />
    </section>
  </div>
</template>

<script>
import OrganismBudget from "@/components/organisms/OrganismBudget";
import OrganismExpenses from "@/components/organisms/OrganismExpenses";
import OrganismRevenues from "@/components/organisms/OrganismRevenues";

import MoleculeLoading from '@/components/molecules/MoleculeLoading';
import MoleculeMonthSwitch from "@/components/molecules/MoleculeMonthSwitch";

import { InternalBankAccountService } from '@/services/internal-bank-account-service';
import { TransactionCategoryService } from '@/services/transaction-category-service';

export default {
  async created() {
    let apiResponse = await this.getAccount();

    if (apiResponse.success) {
      apiResponse = await this.getTransactionCategories();

      if (apiResponse.success) {
        this.dataLoaded = true;
      }
      else {
        this.loadingError = true;
        console.error(apiResponse.error);
      }
    }
    else {
      this.loadingError = true;
      console.error(apiResponse.error);
    }

  },

   components: {
     OrganismBudget,
     OrganismExpenses,
     OrganismRevenues,
     MoleculeLoading,
     MoleculeMonthSwitch,
   },

  data() {
    return {
      account: null,
      transactionCategories: [],
      dataLoaded: false,
      loadingError: false,
      accountNumber: ''
    };
  },

  methods: {
    async getAccount(month) {
      const year = new Date().getFullYear();
      const simpleBankAccount = false;
      month = month !== undefined ? month : new Date().getMonth();

      const apiResponse = await InternalBankAccountService.getById(this.$route.params.id, simpleBankAccount, year, month);

      if (apiResponse.success && apiResponse.data) {
        this.account = apiResponse.data;
        this.accountNumber = this.account.accountNumber;
      }

      return apiResponse;
    },

    async getTransactionCategories(month) {
      const year = new Date().getFullYear();
      month = month !== undefined ? month : new Date().getMonth();

      const apiResponse = await TransactionCategoryService.getAllByAccount(this.$route.params.id, year, month);

      if (apiResponse.success && apiResponse.data) {
        this.transactionCategories = apiResponse.data;
      }
      else if (apiResponse.success && !apiResponse.data) {
        this.transactionCategories = [];
      }

      return apiResponse;
    },

    async updateView(month) {
      console.log(month);
      //TODO - error handling api calls
      await this.getAccount(month);
      await this.getTransactionCategories(month);
    }
  },
};
</script>