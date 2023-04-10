<template>
  <div class="recurring-revenues">
    <AtomHeadline tag="h1" text="Regelmäßige Einnahmen" />

    <MoleculeLoading v-if="!accountsLoaded" :loadingError="accountsLoadingError" errorMessage="Fehler beim Laden der Kontoinhaber!"/>

    <template v-else>
      <div class="pb-5">
        <MoleculeInputAutoSuggest field="account" v-model="account" label="Konto" :items="accounts" @itemPicked="pickAccount" />
      </div>

      <template v-if="account">
        <MoleculeLoading v-if="!recurringRevenuesLoaded" :loadingError="recurringRevenuesLoadingError" errorMessage="Fehler beim Laden der Fixkosten!"/>

        <template v-else>
          <OrganismCollapsibleWithSlot v-if="monthlyRecurringRevenues.length" title="Monatlich">
            <MoleculeRecurringTransactionsTable counterParty="Zahlungspflichtiger" :recurringTransactions="monthlyRecurringRevenues"
                                                @show-detail="showTransactionModal" />
          </OrganismCollapsibleWithSlot>

          <OrganismCollapsibleWithSlot v-if="quarterlyRecurringRevenues.length" title="Vierteljährlich">
            <MoleculeRecurringTransactionsTable counterParty="Zahlungspflichtiger" :recurringTransactions="quarterlyRecurringRevenues"
                                                @show-detail="showTransactionModal" />
          </OrganismCollapsibleWithSlot>

          <OrganismCollapsibleWithSlot v-if="semiannuallyRecurringRevenues.length" title="Halbjährlich">
            <MoleculeRecurringTransactionsTable counterParty="Zahlungspflichtiger" :recurringTransactions="semiannuallyRecurringRevenues"
                                                @show-detail="showTransactionModal" />
          </OrganismCollapsibleWithSlot>

          <OrganismCollapsibleWithSlot v-if="annuallyRecurringRevenues.length" title="Jährlich">
            <MoleculeRecurringTransactionsTable counterParty="Zahlungspflichtiger" :recurringTransactions="annuallyRecurringRevenues"
                                                @show-detail="showTransactionModal" />
          </OrganismCollapsibleWithSlot>

          <AtomParagraph v-if="!monthlyRecurringRevenues.length && !quarterlyRecurringRevenues.length && !semiannuallyRecurringRevenues.length && !annuallyRecurringRevenues.length"
                         text="Keine regelmäßigen Einnahmen auf diesem Konto gefunden!" />

          <MoleculeRecurringTransactionModal v-if="transactionModalActive" :recurringTransaction="selectedTransaction"
                                             @cancel="hideTransactionModal" @save="updateTransaction" />

        </template>
      </template>
    </template>
  </div>
</template>

<script>

import AtomHeadline from '@/components/atoms/AtomHeadline';
import AtomParagraph from '@/components/atoms/AtomParagraph';

import MoleculeInputAutoSuggest from '@/components/molecules/MoleculeInputAutoSuggest';
import MoleculeLoading from '@/components/molecules/MoleculeLoading';
import MoleculeRecurringTransactionsTable from '@/components/molecules/MoleculeRecurringTransactionsTable';
import MoleculeRecurringTransactionModal from '@/components/molecules/MoleculeRecurringTransactionModal';
import OrganismCollapsibleWithSlot from '@/components/organisms/OrganismCollapsibleWithSlot';

import { accountService } from '@/services/account-service';
import { recurringTransactionService } from '@/services/recurring-transaction-service';

export default {
  components: {
    AtomHeadline,
    AtomParagraph,
    MoleculeInputAutoSuggest,
    MoleculeLoading,
    MoleculeRecurringTransactionsTable,
    MoleculeRecurringTransactionModal,
    OrganismCollapsibleWithSlot,
  },

  async created() {
    try {
      await this.getAccounts();

      this.accountsLoaded = true;
    } catch (error) {
      this.accountsLoadingError = true;
    }
  },

  watch: {
    async account() {
      this.recurringRevenuesLoaded = false;
      this.recurringRevenuesLoadingError = false;

      try {
        await this.getRecurringRevenues();

        this.recurringRevenuesLoaded = true;
      } catch (error) {
        this.recurringRevenuesLoadingError = true;
        console.error(error);
      }
    },
  },
  
  data() {
    return {
      account: null,
      accounts: null,
      accountsLoaded: false,
      accountsLoadingError: false,
      annuallyRecurringRevenues: [],
      monthlyRecurringRevenues: [],
      recurringRevenuesLoaded: false,
      recurringRevenuesLoadingError: false,
      quarterlyRecurringRevenues: [],
      selectedTransaction: null,
      semiannuallyRecurringRevenues: [],
      transactionModalActive: false,
    }
  },

  methods: {
    async getAccounts() {
      try {
        let accounts = await accountService.getAll();
        accounts = accounts.filter(b => !b.external).map(
            b => { return { id: b.id, label: `${b.accountHolderName} (${b.iban})`} });

        this.accounts = accounts;
      } catch (error) {
        console.error(error);
        throw new Error(error);
      }
    },

    async getRecurringRevenues() {
      this.recurringRevenues = await recurringTransactionService.getAllByTargetAccount(this.account.id);
      this.monthlyRecurringRevenues = this.recurringRevenues.filter(o => o.cycle === 1);
      this.quarterlyRecurringRevenues = this.recurringRevenues.filter(o => o.cycle === 3);
      this.semiannuallyRecurringRevenues = this.recurringRevenues.filter(o => o.cycle === 6);
      this.annuallyRecurringRevenues = this.recurringRevenues.filter(o => o.cycle === 12);
    },

    hideTransactionModal() {
      this.transactionModalActive = false;
      this.selectedTransaction = null;
    },
    
    pickAccount(id) {
      this.account = this.accounts.find(b => b.id == id);
    },

    showTransactionModal(revenue) {
      this.transactionModalActive = true;
      this.selectedTransaction = revenue;
    },

    //TODO - this is duplicated in Overheads - move it to a service
    async updateTransaction(updatedValues) {
      try {
        const jsonPatchDocument = [];

        for (const prop in updatedValues) {
          if (updatedValues[prop] !== this.selectedTransaction[prop]) {
            jsonPatchDocument.push({
              op: 'replace',
              path: `/${prop}`,
              value: updatedValues[prop],
            });
          }
        }

        await recurringTransactionService.update(this.selectedTransaction.id, jsonPatchDocument);

        this.selectedTransaction = null;
        this.transactionModalActive = false;

        this.overheads = await this.getRecurringRevenues();
      }
      catch (error) {
        console.error(error);
      }
    }
  }
};

</script>