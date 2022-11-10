<template>
  <div class="account-detail">
    <MoleculeLoading v-if="!dataLoaded" :loadingError="loadingError" errorMessage="Fehler beim Laden der Daten!"/>

    <template v-else>
      <AtomHeadline tag="h1" :text="`Detailansicht (${bankAccount.accountNumber})`"/>
      <h3>Hier muss noch das alte OrganismCollapsible durch das neue mit Slot abgelöst werden und anschließend TransactionDetail als Modal implementiert werden</h3>
      <!-- TODO - Einnahmen stimmen hier (macbook) bei zweiter KS noch nicht, die Umbuchung ist als Einnahme aufgeführt -->
      <section>
        <MoleculeMonthSwitch @month-switched="updateView"/>
        <OrganismRevenues :bankAccount="bankAccount"/>
        <!-- TODO - not all entries are visible - the height of the collapsible is too low, the last entries are cut off -->
        <OrganismBudget :costCenters="costCenters"/>
        <OrganismExpenses :bankAccount="bankAccount"/>
      </section>
    </template>
  </div>
</template>

<script>
import AtomHeadline from '@/components/atoms/AtomHeadline';
import OrganismBudget from "@/components/organisms/OrganismBudget";
import OrganismExpenses from "@/components/organisms/OrganismExpenses";
import OrganismRevenues from "@/components/organisms/OrganismRevenues";

import MoleculeLoading from '@/components/molecules/MoleculeLoading';
import MoleculeMonthSwitch from "@/components/molecules/MoleculeMonthSwitch";

import { BankAccountService } from '@/services/bank-account-service';
import {costCenterService} from '@/services/cost-center-service';

export default {
  async created() {
    try {
      await this.getData();

      this.dataLoaded = true;
    } catch (error) {
      this.loadingError = true;
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
      bankAccount: null,
      costCenters: null,
      dataLoaded: false,
      loadingError: false,
    };
  },

  methods: {
    async getData(month) {
      try {
        const year = new Date().getFullYear();
        month = month !== undefined ? month : new Date().getMonth();

        const bankAccount = BankAccountService.getSingleById(this.$route.params.id, year, month);
        const costCenters = costCenterService.getAllByAccount(this.$route.params.id, year, month);

        this.bankAccount = await bankAccount;
        this.costCenters = await costCenters;
      } catch (error) {
        console.error(error);
        throw new Error(error);
      }
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