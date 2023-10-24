<template>
  <div class="account-detail">
    <MoleculeLoading v-if="!dataLoaded" :loadingError="loadingError" errorMessage="Fehler beim Laden der Daten!"/>

    <template v-else>
      <AtomHeadline tag="h1" :text="`Detailansicht (${bankAccount.accountNumber})`"/>
      <!-- TODO - Einnahmen stimmen hier bei zweiter KS noch nicht, die Umbuchung ist als Einnahme aufgeführt -->
      <section>

        <MoleculeMonthSwitch @month-switched="updateView" class="mb-5"/>

        <OrganismCollapsibleWithSlot title="Einnahmen" accordionId="revenues">
          <MoleculeRevenuesTable :bankAccount="bankAccount" />
        </OrganismCollapsibleWithSlot>

        <OrganismCollapsibleWithSlot title="Budget" accordionId="budget">
          <MoleculeBudgetTable :costCenters="costCenters" :bankAccount="bankAccount" :selectedMonth="selectedMonth" />
        </OrganismCollapsibleWithSlot>

        <!-- TODO - not all entries are visible - the height of the collapsible is too low, the last entries are cut off -->
        <OrganismCollapsibleWithSlot title="Ausgaben" accordionId="expenses">
          <MoleculeExpensesTable :bankAccount="bankAccount" />
        </OrganismCollapsibleWithSlot>
      </section>
    </template>
  </div>
</template>

<script>
import AtomHeadline from '@/components/atoms/AtomHeadline';
import MoleculeBudgetTable from '@/components/molecules/MoleculeBudgetTable';
import MoleculeExpensesTable from '@/components/molecules/MoleculeExpensesTable'
import MoleculeLoading from '@/components/molecules/MoleculeLoading';
import MoleculeMonthSwitch from "@/components/molecules/MoleculeMonthSwitch";
import MoleculeRevenuesTable from "@/components/molecules/MoleculeRevenuesTable";
import OrganismCollapsibleWithSlot from "../organisms/OrganismCollapsibleWithSlot";

import { accountService } from '@/services/account-service';
import { costCenterService } from '@/services/cost-center-service';

export default {
  components: {
    AtomHeadline,
    MoleculeBudgetTable,
    MoleculeExpensesTable,
    MoleculeLoading,
    MoleculeMonthSwitch,
    MoleculeRevenuesTable,
    OrganismCollapsibleWithSlot,
  },

  async created() {
    try {
      if (this.$cookies.get('user')) {
        this.user = this.$cookies.get('user');
      }

      await this.getData();

      this.dataLoaded = true;
    } catch (error) {
      this.loadingError = true;
    }
  },

  data() {
    return {
      bankAccount: null,
      costCenters: null,
      dataLoaded: false,
      loadingError: false,
      selectedMonth: null,
      user: null,
    };
  },

  methods: {
    async getData(month) {
      try {
        const year = new Date().getFullYear();
        month = month !== undefined ? month : new Date().getMonth();

        const bankAccount = accountService.getSingleById(this.$route.params.id, year, month);
        const costCenters = costCenterService.getAllByUserAndAccount(this.user.id, this.$route.params.id, year, month);

        this.bankAccount = await bankAccount;
        this.costCenters = await costCenters;
        this.selectedMonth = month;
      } catch (error) {
        console.error(error);
        throw new Error(error);
      }
    },

    async updateView(month) {
      await this.getData(month);
    }
  },
};
</script>