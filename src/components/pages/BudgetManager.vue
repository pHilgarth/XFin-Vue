<template>
  <section class="budget-manager">
    <AtomHeadline tag="h1" text="Budgetmanager" />
    <MoleculeLoading v-if="!accountsLoaded" :loadingError="accountsLoadingError" errorMessage="Fehler beim Laden der Kontoinhaber!"/>

    <template v-else>
      <div class="pb-5">
        <MoleculeInputAutoSuggest field="account" v-model="account" label="Konto" :items="accounts" @itemPicked="pickAccount" />
      </div>

      <template v-if="account">
        <MoleculeLoading v-if="!costCentersLoaded" :loadingError="costCenterLoadingError" errorMessage="Fehler beim Laden der Kostenstellen!"/>

        <template v-else>
          <div class="budget-manager__free-budget mb-4">
            <div class="budget-manager__free-budget__name col-6">
              Freies Budget
            </div>
            <div class="budget-manager__free-budget__value col-6">
              {{ formatCurrency(freeBudget) }}
            </div>
          </div>

          <OrganismCostCenterList
              :costCenters="costCenters"
              :account="this.account"
              @reload="getCostCenters"
              @save="save"
              @updateFreeBudget="freeBudget = $event"
          />

<!--          <OrganismCollapsibleWithSlot v-for="costCenter in costCenters" :key="costCenter.id" :title="`${costCenter.name} ${formatCurrency(costCenter.balance)}`">-->
<!--            <MoleculeBudgetTable :balance="costCenter.balance" :costCenterAssets="costCenter.costCenterAssets"-->
<!--                                 :reserves="costCenter.reserves" @save-cost-center-asset="saveCostCenterAsset(costCenter.id, $event)"-->
<!--                                 @updateCostCenterAsset="updateCostCenterAsset($event)" />-->
<!--          </OrganismCollapsibleWithSlot>-->

        </template>

      </template>
    </template>
  </section>
</template>

<script>
//import AtomEditIcon from "../atoms/AtomEditIcon";
import AtomHeadline from '@/components/atoms/AtomHeadline';
//import MoleculeBudgetTable from '@/components/molecules/MoleculeBudgetTable';
//import MoleculeCostCenterListItem from '@/components/molecules/MoleculeCostCenterListItem';
import MoleculeInputAutoSuggest from '@/components/molecules/MoleculeInputAutoSuggest';
//import MoleculeInputSelect from '@/components/molecules/MoleculeInputSelect';
import MoleculeLoading from '@/components/molecules/MoleculeLoading';
//import OrganismCollapsibleWithSlot from "../organisms/OrganismCollapsibleWithSlot";
import OrganismCostCenterList from '@/components/organisms/OrganismCostCenterList';

import { accountService } from '@/services/account-service';
import { costCenterAssetService } from '@/services/cost-center-asset-service';
import { costCenterService } from '@/services/cost-center-service';

import { numberService } from '@/services/number-service';

export default {
  async created() {
    try {
      if (this.$cookies.get('user')) {
        this.user = this.$cookies.get('user');
      }

      await this.getAccounts();
      this.accountsLoaded = true;
    }
    catch (error) {
      console.error(error);
      this.accountsLoadingError = true;
    }
  },

  components: {
    //AtomEditIcon,
    AtomHeadline,
    //MoleculeBudgetTable,
    //MoleculeCostCenterListItem,
    MoleculeInputAutoSuggest,
    MoleculeLoading,
    //OrganismCollapsibleWithSlot,
    OrganismCostCenterList
  },
  
  data() {
    return {
      account: null,
      accounts: null,
      accountsLoaded: false,
      accountsLoadingError: false,
      costCenters: null,
      costCentersLoaded: false,
      costCenterLoadingError: false,
      freeBudget: null,
      user: null,
    }
  },

  methods: {
    calculateFreeBudget() {
      return this.account.totalBalance - this.costCenters.reduce((a, b) => a + b.balance, 0);
    },

    formatCurrency(value) {
      return numberService.formatCurrency(value);
    },

    async getAccounts() {
      try {
        let accounts = await accountService.getAllByUser(this.user.id);
        accounts = accounts.filter(b => !b.external).map(
            b => { return { id: b.id, label: `${b.accountHolderName} (${b.iban})`, totalBalance: b.balance + b.cash } });

        this.accounts = accounts;
      }
      catch (error) {
        console.error(error);
        throw new Error(error);
      }
    },

    async getCostCenters() {
      try {
        const year = new Date().getFullYear();
        const month = new Date().getMonth();

        this.costCenters = await costCenterService.getAllByUserAndAccount(this.user.id, this.account.id, year, month);

        this.costCentersLoaded = true;
      } catch (error) {
        this.costCenterLoadingError = true;
        console.error(error);
      }
    },

    pickAccount(id) {
      this.account = this.accounts.find(b => b.id == id);
    },

    // async saveCostCenterAsset(costCenterId, name) {
    //   try {
    //     await costCenterAssetService.create({
    //       name: name,
    //       bankAccountId: this.account.id,
    //       costCenterId: costCenterId,
    //     });
    //
    //     await this.getCostCenters();
    //   }
    //   catch (error) {
    //     console.error(error);
    //   }
    // },

    async updateCostCenterAsset(data) {
      try {
        const jsonPatchDocument = [];

        for (const prop in data) {
          if (prop !== 'id') {
            jsonPatchDocument.push({
              op: 'replace',
              path: `/${prop}`,
              value: data[prop],
            });
          }
        }

        await costCenterAssetService.update(data.id, jsonPatchDocument);
        await this.getCostCenters();
      }
      catch (error) {
        console.error(error);
      }
    }
  },

  watch: {
    async account() {
      this.costCentersLoaded = false;
      this.costCenterLoadingError = false;

      await this.getCostCenters();
      this.freeBudget = this.calculateFreeBudget();
    },
  },
};
</script>