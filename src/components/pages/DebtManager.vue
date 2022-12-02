<template>
  <div class="debt-manager">
    <AtomHeadline tag="h1" text="Schuldenmanager" />
    <MoleculeLoading v-if="!bankAccountsLoaded" :loadingError="bankAccountsLoadingError" errorMessage="Fehler beim Laden der Kontoinhaber!"/>

    <template v-else>
      <div class="pb-5">
        <MoleculeInputAutoSuggest field="bank-account" v-model="bankAccount" label="Konto"
                                  :items="bankAccounts" @itemPicked="pickBankAccount" />
      </div>
      <template v-if="bankAccount">
        <MoleculeLoading v-if="!loansLoaded" :loadingError="loansLoadingError" errorMessage="Fehler beim Laden der Rücklagen!"/>

        <template v-else>
          <OrganismCollapsibleWithSlot v-if="creditorLoans.length > 0" title="Gläubiger">
            <MoleculeLoanTable :loans="creditorLoans" />
          </OrganismCollapsibleWithSlot>

          <OrganismCollapsibleWithSlot v-if="debitorLoans.length > 0" title="Schuldner">
            <MoleculeLoanTable :loans="debitorLoans" />
          </OrganismCollapsibleWithSlot>

          <AtomParagraph v-if="creditorLoans.length === 0 && debitorLoans.length === 0" text="Keine Darlehen auf diesem Konto gefunden!" />

        </template>
      </template>
    </template>
  </div>
</template>

<script>

import AtomHeadline from '@/components/atoms/AtomHeadline';
import AtomParagraph from "../atoms/AtomParagraph";
import MoleculeInputAutoSuggest from '@/components/molecules/MoleculeInputAutoSuggest';
import MoleculeLoading from '@/components/molecules/MoleculeLoading';
import MoleculeLoanTable from '@/components/molecules/MoleculeLoanTable';
import OrganismCollapsibleWithSlot from "../organisms/OrganismCollapsibleWithSlot";

import { bankAccountService } from '@/services/bank-account-service';
import { loanService } from '@/services/loan-service';

export default {
  components: {
    AtomHeadline,
    AtomParagraph,
    MoleculeInputAutoSuggest,
    MoleculeLoading,
    MoleculeLoanTable,
    OrganismCollapsibleWithSlot,
  },

  async created() {
    try {
      await this.getBankAccounts();

      this.bankAccountsLoaded = true;
    } catch (error) {
      this.bankAccountsLoadingError = true;
    }
  },

  data() {
    return {
      bankAccount: null,
      bankAccounts: null,
      bankAccountsLoaded: false,
      bankAccountsLoadingError: false,
      creditorLoans: null,
      debitorLoans: null,
      loansLoaded: false,
      loansLoadingError: false,
    }
  },

  methods: {
    async getBankAccounts() {
      try {
        let bankAccounts = await bankAccountService.getAll();
        bankAccounts = bankAccounts.filter(b => !b.external).map(
            b => { return { id: b.id, label: `${b.accountHolderName} (${b.iban})`} });

        this.bankAccounts = bankAccounts;
      } catch (error) {
        console.error(error);
        throw new Error(error);
      }
    },

    pickBankAccount(id) {
      this.bankAccount = this.bankAccounts.find(b => b.id == id);
    },
  },

  watch: {
    async bankAccount() {
      this.loansLoaded = false;
      this.loansLoadingError = false;

      try {
        const loans = await loanService.getAllByBankAccount(this.bankAccount.id);

        this.creditorLoans = loans.filter(l => l.creditorBankAccount.id === this.bankAccount.id);console.log(this.creditorLoans);
        this.debitorLoans = loans.filter(l => l.debitorBankAccount.id === this.bankAccount.id);console.log(this.debitorLoans);

        this.loansLoaded = true;
      } catch (error) {
        this.loansLoadingError = true;
        console.error(error);
      }
    },
  },
};

</script>