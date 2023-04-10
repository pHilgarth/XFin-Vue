<template>
  <div class="overheads">
    <AtomHeadline tag="h1" text="Fixkosten" />

    <p>Turnus bearbeiten lassen! Dann müssen die Tabellen neu geladen werden, damit die Transaktion in die jeweilige Tabelle verschoben wird!</p>
    <MoleculeLoading v-if="!accountsLoaded" :loadingError="accountsLoadingError" errorMessage="Fehler beim Laden der Kontoinhaber!"/>

    <template v-else>
      <div class="pb-5">
        <MoleculeInputAutoSuggest field="account" v-model="account" label="Konto" :items="accounts" @itemPicked="pickAccount" />
      </div>

      <template v-if="account">
        <MoleculeLoading v-if="!overheadsLoaded" :loadingError="overheadsLoadingError" errorMessage="Fehler beim Laden der Fixkosten!"/>

        <template v-else>
          <OrganismCollapsibleWithSlot v-if="monthlyOverheads.length" title="Monatlich">
            <MoleculeRecurringTransactionsTable counterParty="Zahlungsempfänger" :recurringTransactions="monthlyOverheads"
                                                @show-detail="activateTransactionModal" />
          </OrganismCollapsibleWithSlot>

          <OrganismCollapsibleWithSlot v-if="quarterlyOverheads.length" title="Vierteljährlich">
            <MoleculeRecurringTransactionsTable counterParty="Zahlungsempfänger" :recurringTransactions="quarterlyOverheads"
                                                @show-detail="activateTransactionModal" />
          </OrganismCollapsibleWithSlot>

          <OrganismCollapsibleWithSlot v-if="semiannuallyOverheads.length" title="Halbjährlich">
            <MoleculeRecurringTransactionsTable counterParty="Zahlungsempfänger" :recurringTransactions="semiannuallyOverheads"
                                                @show-detail="activateTransactionModal" />
          </OrganismCollapsibleWithSlot>

          <OrganismCollapsibleWithSlot v-if="annuallyOverheads.length" title="Jährlich">
            <MoleculeRecurringTransactionsTable counterParty="Zahlungsempfänger" :recurringTransactions="annuallyOverheads"
                                                @show-detail="activateTransactionModal" />
          </OrganismCollapsibleWithSlot>

          <AtomParagraph v-if="!monthlyOverheads.length && !quarterlyOverheads.length && !semiannuallyOverheads.length && !annuallyOverheads.length"
                         text="Keine Fixkosten auf diesem Konto gefunden!" />

          <MoleculeRecurringTransactionModal v-if="transactionModalActive" :recurringTransaction="selectedTransaction"
                                             @cancel="hideTransactionModal" @save="updateTransaction"/>
        </template>
      </template>

      <AtomButton type="primary" text="Fixkosten anlegen" @click.prevent="$router.push('/recurring-transaction')" />

    </template>
  </div>
</template>

<script>
  import AtomButton from '@/components/atoms/AtomButton';
  import AtomHeadline from '@/components/atoms/AtomHeadline';
  import AtomParagraph from '@/components/atoms/AtomParagraph';

  import MoleculeInputAutoSuggest from '@/components/molecules/MoleculeInputAutoSuggest';
  import MoleculeLoading from '@/components/molecules/MoleculeLoading';
  import MoleculeRecurringTransactionModal from '@/components/molecules/MoleculeRecurringTransactionModal'
  import MoleculeRecurringTransactionsTable from '@/components/molecules/MoleculeRecurringTransactionsTable';

  import OrganismCollapsibleWithSlot from "../organisms/OrganismCollapsibleWithSlot";

  import { accountService } from '@/services/account-service';
  import { recurringTransactionService } from '@/services/recurring-transaction-service';

  export default {
    components: {
      AtomButton,
      AtomHeadline,
      AtomParagraph,
      MoleculeInputAutoSuggest,
      MoleculeLoading,
      MoleculeRecurringTransactionModal,
      MoleculeRecurringTransactionsTable,
      OrganismCollapsibleWithSlot,
    },

    async created() {
      try {
        //TODO - this is duplicated - maybe move it in a service?
        if (this.$cookies.get('user')) {
          this.user = this.$cookies.get('user');
        }

        await this.getAccounts();

        this.accountsLoaded = true;
      } catch (error) {
        this.accountsLoadingError = true;
      }
    },

    watch: {
      async account() {
        this.overheadsLoaded = false;
        this.overheadsLoadingError = false;

        try {
          await this.getOverheads();

          this.overheadsLoaded = true;
        } catch (error) {
          this.overheadsLoadingError = true;
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
        annuallyOverheads: [],
        monthlyOverheads: [],
        overheadsLoaded: false,
        overheadsLoadingError: false,
        quarterlyOverheads: [],
        selectedTransaction: null,
        semiannuallyOverheads: [],
        transactionModalActive: false,
        user: null,
      }
    },

    methods: {
      activateTransactionModal(transaction) {
        this.transactionModalActive = true;
        this.selectedTransaction = transaction;
      },

      async getAccounts() {
        try {
          let accounts = await accountService.getAllByUser(this.user.id);
          accounts = accounts.filter(b => !b.external).map(
              b => { return { id: b.id, label: `${b.accountHolderName} (${b.iban})`} });

          this.accounts = accounts;
        } catch (error) {
          console.error(error);
          throw new Error(error);
        }
      },

      async getOverheads() {
        this.overheads = await recurringTransactionService.getAllBySourceAccount(this.account.id);
        this.monthlyOverheads = this.overheads.filter(o => o.cycle === 1);
        this.quarterlyOverheads = this.overheads.filter(o => o.cycle === 3);
        this.semiannuallyOverheads = this.overheads.filter(o => o.cycle === 6);
        this.annuallyOverheads = this.overheads.filter(o => o.cycle === 12);
      },

      hideTransactionModal() {
        this.transactionModalActive = false;
        this.selectedTransaction = null;
      },

      pickAccount(id) {
        this.account = this.accounts.find(b => b.id == id);
      },

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

          this.overheads = await this.getOverheads();
        }
        catch (error) {
          console.error(error);
        }
      }
    },
  };
</script>