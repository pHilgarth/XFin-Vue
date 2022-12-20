<template>
  <section class="budget-manager">
    <AtomHeadline tag="h1" text="Budgetmanager" />
    <!-- TODO - verfügbarer Betrag einer KS muss auch geplante Ausgaben berücksichtigen! Geld für geplante Ausgaben kann nicht umgebucht werden -->
    <!-- TODO - bei offenen Änderungen wär es cool, wenn der Collapsible Header irgendwie hervorgehen würde, allerdings müsste ich die Info irgendwie ans parent übergeben (OrgansimCollapsible)-->
    <!-- TODO - error message kann unterschiedelich sein, nicht hardcoded -->
    <!-- TODO - Überlegung: Soll BudgetManager nach dem Speichern auf die Startseite zurück routen? Man kann die Konten aber separat speichern, daher wohl eher nicht? -->
    <MoleculeLoading v-if="!accountsLoaded" :loadingError="accountsLoadingError" errorMessage="Fehler beim Laden der Kontoinhaber!"/>

    <template v-else>
      <div class="pb-5">
        <MoleculeInputAutoSuggest field="account" v-model="account" label="Konto" :items="accounts" @itemPicked="pickAccount" />
      </div>

      <template v-if="account">
        <MoleculeLoading v-if="!costCentersLoaded" :loadingError="costCenterLoadingError" errorMessage="Fehler beim Laden der Kostenstellen!"/>

        <template v-else>
          <div class="budget-manager__unallocated mb-4">
            <div class="budget-manager__unallocated__name col-6">
              Nicht zugewiesen
            </div>
            <div class="budget-manager__unallocated__value col-6">
              {{ formatCurrency(costCenters.find(c => c.name === 'Nicht zugewiesen').amount) }}
            </div>
          </div>
          <OrganismCollapsibleWithSlot v-for="costCenter in costCenters.filter(c => c.name !== 'Nicht zugewiesen')" :key="costCenter.id" :title="costCenter.name">
            <MoleculeBudgetTable :amount="costCenter.amount" :costCenterAssets="costCenter.costCenterAssets"
                                 :reserves="costCenter.reserves" @save-cost-center-asset="saveCostCenterAsset(costCenter.id, $event)"
                                 @updateCostCenterAsset="updateCostCenterAsset($event)" />
          </OrganismCollapsibleWithSlot>

          <pre>{{ costCenters }}</pre>
        </template>

      </template>
    </template>
  </section>
</template>

<script>
import AtomHeadline from '@/components/atoms/AtomHeadline';

import MoleculeBudgetTable from '@/components/molecules/MoleculeBudgetTable';
import MoleculeInputAutoSuggest from '@/components/molecules/MoleculeInputAutoSuggest';
//import MoleculeInputSelect from '@/components/molecules/MoleculeInputSelect';
import MoleculeLoading from '@/components/molecules/MoleculeLoading';

//import OrganismCollapsible from '@/components/organisms/OrganismCollapsible';
import OrganismCollapsibleWithSlot from "../organisms/OrganismCollapsibleWithSlot";

import { accountService } from '@/services/account-service';
import { costCenterAssetService } from '@/services/cost-center-asset-service';
import { costCenterService } from '@/services/cost-center-service';

import { numberService } from '@/services/number-service';

export default {
  async created() {
    try {
      await this.getAccounts();
      this.accountsLoaded = true;
    }
    catch (error) {
      console.error(error);
      this.accountsLoadingError = true;
    }
  },

  components: {
    AtomHeadline,
    MoleculeBudgetTable,
    MoleculeInputAutoSuggest,
    //MoleculeInputSelect,
    MoleculeLoading,
    //OrganismCollapsible,
    OrganismCollapsibleWithSlot,
  },

  watch: {
    async account() {
      this.costCentersLoaded = false;
      this.costCenterLoadingError = false;

      await this.getCostCenters();
    },
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
    }
  },

  methods: {
    // async showBankAccounts() {
    //   const accountHolder = this.selectedAccountHolder;
    //   let loadingError = false;
    //
    //   for (let i = 0; i < accountHolder.bankAccounts.length; i++) {
    //     let bankAccount = accountHolder.bankAccounts[i]
    //
    //     const categoriesResponse = await this.getCostCenters(bankAccount);
    //
    //     if (categoriesResponse.error) {
    //       loadingError = true;
    //       this.errorMessage = 'Daten konnten nicht geladen werden. (Dev-Hint: Categories failed)';
    //       break;
    //     }
    //   }
    //
    //   if (!loadingError) {
    //     this.categoriesLoaded = true;
    //   }
    //   else {
    //     this.categoriesLoadingError = true;
    //   }
    // },

    formatCurrency(value) {
      return numberService.formatCurrency(value);
    },

    async getAccounts() {
      try {
        let accounts = await accountService.getAll();
        accounts = accounts.filter(b => !b.external).map(
            b => { return { id: b.id, label: `${b.accountHolderName} (${b.iban})`} });

        this.accounts = accounts;
      }
      catch (error) {
        console.error(error);
        throw new Error(error);
      }




      // const includeAccounts = true;
      // const accountHolderResponse = await accountHolderService.getAllByUser(includeAccounts);
      //
      // if (accountHolderResponse.success && accountHolderResponse.data) {
      //   this.accountHolders = accountHolderResponse.data;
      //
      //   this.accountHolderOptions = [{disabled: true, label: '(Kontoinhaber wählen)'}];
      //
      //   this.accountHolders.forEach(a => {
      //     this.accountHolderOptions.push({
      //       label: a.name,
      //     });
      //   });
      // } else if (accountHolderResponse.success && !accountHolderResponse.data) {
      //   this.accountHolders = [];
      // }
      //
      // return accountHolderResponse;
    },

    async getCostCenters() {
      try {
        const year = new Date().getFullYear();
        const month = new Date().getMonth();

        this.costCenters = await costCenterService.getAllByAccount(this.account.id, year, month);

        this.costCentersLoaded = true;
      } catch (error) {
        this.costCenterLoadingError = true;
        console.error(error);
      }
    },

    pickAccount(id) {
      this.account = this.accounts.find(b => b.id == id);
    },

    async saveCostCenterAsset(costCenterId, name) {
      try {
        await costCenterAssetService.create({
          name: name,
          bankAccountId: this.account.id,
          costCenterId: costCenterId,
        });

        await this.getCostCenters();
      }
      catch (error) {
        console.error(error);
      }
    },

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
  }
};
</script>