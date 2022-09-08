<template>
  <div class="account-detail">
    <AtomHeadline tag="h1" :text="`Detailansicht (${accountNumber})`"/>
    <!-- TODO - Einnahmen stimmen hier (macbook) bei zweiter KS noch nicht, die Umbuchung ist als Einnahme aufgeführt -->
    <MoleculeLoading v-if="!dataLoaded" :loadingError="loadingError" errorMessage="Fehler beim Laden der Daten!"/>
    <section v-else>
      <MoleculeMonthSwitch @month-switched="updateView"/>
      <OrganismRevenues :account="account"/>
      <!-- TODO - not all entries are visible - the height of the collapsible is too low, the last entries are cut off -->
      <OrganismBudget :costCenters="costCenters"/>
      <OrganismExpenses :account="account"/>
    </section>
  </div>
</template>

<script>
import AtomHeadline from '@/components/atoms/AtomHeadline';
import OrganismBudget from "@/components/organisms/OrganismBudget";
import OrganismExpenses from "@/components/organisms/OrganismExpenses";
import OrganismRevenues from "@/components/organisms/OrganismRevenues";

import MoleculeLoading from '@/components/molecules/MoleculeLoading';
import MoleculeMonthSwitch from "@/components/molecules/MoleculeMonthSwitch";

import { bankAccountService } from '@/services/bank-account-service';
import {costCenterService} from '@/services/cost-center-service';

export default {
  async created() {
    let apiResponse = await this.getAccount();

    if (apiResponse.success) {
      apiResponse = await this.getCostCenters();

      if (apiResponse.success) {
        this.dataLoaded = true;
      } else {
        this.loadingError = true;
        console.error(apiResponse.error);
      }
    } else {
      this.loadingError = true;
      console.error(apiResponse.error);
    }

  },

  components: {
    AtomHeadline,
    OrganismBudget,
    OrganismExpenses,
    OrganismRevenues,
    MoleculeLoading,
    MoleculeMonthSwitch,
  },

  data() {
    return {
      account: null,
      costCenters: [],
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

      const apiResponse = await bankAccountService.getSingleById(this.$route.params.id, simpleBankAccount, year, month);

      if (apiResponse.success && apiResponse.data) {
        this.account = apiResponse.data;
        this.accountNumber = this.account.accountNumber;
      }

      return apiResponse;
    },

    async getCostCenters(month) {
      const year = new Date().getFullYear();
      month = month !== undefined ? month : new Date().getMonth();

      const apiResponse = await costCenterService.getAllByAccount(this.$route.params.id, year, month);

      if (apiResponse.success && apiResponse.data) {
        this.costCenters = apiResponse.data;
      } else if (apiResponse.success && !apiResponse.data) {
        this.costCenters = [];
      }

      return apiResponse;
    },

    async updateView(month) {
      console.log(month);
      //TODO - error handling api calls
      await this.getAccount(month);
      await this.getCostCenters(month);
    }
  },
};
</script>