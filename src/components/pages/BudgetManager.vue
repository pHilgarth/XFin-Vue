<template>
  <section class="budget-manager">
    <h1>Budgetmanager (zweimal Speichern hintereinander liefert einen ERROR beim 2. mal</h1>
    <!-- TODO - verfügbarer Betrag einer KS muss auch geplante Ausgaben berücksichtigen! Geld für geplante Ausgaben kann nicht umgebucht werden -->
    <!-- TODO - bei offenen Änderungen wär es cool, wenn der Collapsible Header irgendwie hervorgehen würde, allerdings müsste ich die Info irgendwie ans parent übergeben (OrgansimCollapsible)-->
    <!-- TODO - error message kann unterschiedelich sein, nicht hardcoded -->
    <!-- TODO - Überlegung: Soll BudgetManager nach dem Speichern auf die Startseite zurück routen? Man kann die Konten aber separat speichern, daher wohl eher nicht? -->
    <MoleculeLoading v-if="!accountHoldersLoaded" :loadingError="accountHoldersLoadingError" errorMessage="Fehler beim Laden der Kontoinhaber!"/>

    <template v-else>
      <MoleculeInputSelect classList="budget-manager__account-holder pb-5" :options="accountHolderOptions"
                           field="accountHolder" v-model="selectedAccountHolderName" label="Budget verwalten für:"/>

      <MoleculeLoading v-if="selectedAccountHolder && !categoriesLoaded" :loadingError="categoriesLoadingError" errorMessage="Fehler beim Laden der Konten!" />

      <template v-else-if="selectedAccountHolder && categoriesLoaded">
        <template v-for="(bankAccount, index) in selectedAccountHolder.bankAccounts" :key="index">
          <OrganismCollapsible :config="configureCollapsible(bankAccount)"/>
        </template>
      </template>
    </template>
  </section>
</template>

<script>
import MoleculeInputSelect from '@/components/molecules/MoleculeInputSelect';
import MoleculeLoading from '@/components/molecules/MoleculeLoading';
import OrganismCollapsible from '@/components/organisms/OrganismCollapsible';

import {AccountHolderService} from '@/services/account-holder-service';
//import { AccountSettingsService } from '@/services/account-settings-service';
import {NumberService} from '@/services/number-service';
import {TransactionCategoryService} from '@/services/transaction-category-service.js';

export default {
  async created() {
    const apiResponse = await this.getAccountHolders();

    if (apiResponse.success) {
      this.accountHoldersLoaded = true;
    } else {
      this.accountHoldersLoadingError = true;
    }
  },

  components: {
    MoleculeInputSelect,
    MoleculeLoading,
    OrganismCollapsible,
  },

  data() {
    return {
      accountHoldersLoaded: false,
      accountHoldersLoadingError: false,
      categoriesLoaded: false,
      categoriesLoadingError: false,
      accountHolders: [],
      accountHolderOptions: null,

      selectedAccountHolder: null,
      selectedAccountHolderName: '(Kontoinhaber wählen)',
    }
  },

  watch: {
    async selectedAccountHolderName() {
      this.categoriesLoaded = false;
      this.selectedAccountHolder = this.accountHolders.find(a => a.name === this.selectedAccountHolderName);
      await this.showBankAccounts();
    }
  },

  methods: {
    async showBankAccounts() {
      const accountHolder = this.selectedAccountHolder;
      let loadingError = false;

      for (let i = 0; i < accountHolder.bankAccounts.length; i++) {
        let bankAccount = accountHolder.bankAccounts[i]

        const categoriesResponse = await this.getTransactionCategories(bankAccount);

        if (categoriesResponse.error) {
          loadingError = true;
          this.errorMessage = 'Daten konnten nicht geladen werden. (Dev-Hint: Categories failed)';
          break;
        }
      }

      if (!loadingError) {
        this.categoriesLoaded = true;
      }
      else {
        this.categoriesLoadingError = true;
      }
    },

    async getTransactionCategories(bankAccount) {
      const year = new Date().getFullYear();
      const month = new Date().getMonth();

      const apiResponse = await TransactionCategoryService.getAllByAccount(bankAccount.id, year, month);

      if (apiResponse.success && apiResponse.data) {
        bankAccount.transactionCategories = apiResponse.data;

        bankAccount.transactionCategories.forEach(category => {
          //category.balance has to be a string although it's actually a number
          //this is because of the dynamic freeBudget calculation in OrganismBudgetList
          category.balance = NumberService.formatCurrency(category.balance, false);
          category.bankAccountId = bankAccount.id;
        });
      }

      return apiResponse;
    },

    configureCollapsible(bankAccount) {
      return {
        collapsed: true,
        title: bankAccount.accountNumber,
        content: [{
          component: {
            tag: 'OrganismBudgetList',
            props: {
              bankAccount: bankAccount,
              transactionCategories: bankAccount.transactionCategories,
            },
          },
        }],
      };
    },
//TODO - die ganzen API-Calls müssen optimiert werden, bzw. das Error-Handling ...
    async getAccountHolders() {
      const includeAccounts = true;
      const accountHolderResponse = await AccountHolderService.getAll(includeAccounts);

      if (accountHolderResponse.success && accountHolderResponse.data) {
        this.accountHolders = accountHolderResponse.data;

        this.accountHolderOptions = [{disabled: true, value: '(Kontoinhaber wählen)'}];

        this.accountHolders.forEach(a => {
          this.accountHolderOptions.push({
            disabled: false,
            value: a.name,
          });
        });
      } else if (accountHolderResponse.success && !accountHolderResponse.data) {
        this.accountHolders = [];
      }

      return accountHolderResponse;
    },
  }
};
</script>