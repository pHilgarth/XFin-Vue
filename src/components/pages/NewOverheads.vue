<template>
  <div class="new-overheads">
    <AtomHeadline tag="h1" text="Wiederkehrende Transaktion" />

    <MoleculeLoading v-if="!dataLoaded" :loadingError="loadingError" errorMessage="Fehler beim Laden der Daten!"/>


    <OrganismRecurringTransaction />

<!--    <OrganismTransactionForm-->
<!--        :costCenters="costCenters"-->
<!--        :payerAccounts="payerAccounts"-->
<!--        :payeeAccounts="payeeAccounts"-->
<!--        :transactionType="transactionType"-->
<!--        :initialPayeeAccount="payeeAccount"-->
<!--        :initialPayerAccount="payerAccount"-->
<!--        @addExternalParty="showExternalPartyForm = true"-->
<!--        @saveTransaction="saveTransaction"-->
<!--        @updatePayeeAccounts="updatePayeeAccounts"-->
<!--    />-->

  </div>
</template>

<script>

import AtomHeadline from '@/components/atoms/AtomHeadline';
import MoleculeLoading from '@/components/molecules/MoleculeLoading';
import OrganismRecurringTransaction from "@/components/organisms/OrganismRecurringTransaction";
//import OrganismTransactionForm from "@/components/organisms/OrganismTransactionForm";

import { accountService } from '@/services/account-service';
import { costCenterService } from '@/services/cost-center-service';

export default {
  components: {
    AtomHeadline,
    MoleculeLoading,
    OrganismRecurringTransaction,
    //OrganismTransactionForm,
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
      accountHolders: null,
      bankAccount: null,
      bankAccounts: null,
      costCenter: null,
      costCenters: null,
      dataLoaded: false,
      loadingError: false,
      targetAmount: null,
      targetDate: null,
      reference: '',
      user: null,
    }
  },

  methods: {
    //TODO - i should move these get....() methods into the service or update the services, so I can call them from the created method
    async getData() {
      try {
        const bankAccountsResult = accountService.getAllByUser(this.user.id);
        //TODO - does this work?
        let costCentersResult = costCenterService.getAllByUser(this.user.id);

        let bankAccounts = await bankAccountsResult;
        bankAccounts = bankAccounts.filter(b => !b.external).map(
            b => { return { id: b.id, label: `${b.accountHolderName} (${b.iban})`} });

        let costCenters = await costCentersResult;

        this.bankAccounts = bankAccounts;
        this.costCenters = costCenters.map(c => {
          return { id: c.id, label: c.name }
        });

        this.dataLoaded = true;
      } catch (error) {
        console.error(error);
        throw new Error(error);
      }
    },

    async saveRecurringTransaction(recurringTransaction) {
      recurringTransaction.isRecurring = true;
      recurringTransaction.cycle = this.cycleItem.id;
      recurringTransaction.dayOfMonth = this.dayOfMonth;
      //TODO - implement option to provide start and end date
      recurringTransaction.startDate = new Date().toISOString();
      //recurringTransaction.endDate = this.endDate;
    }
  },

  watch: {
    targetAmount() {
      this.v$.targetAmount.$touch();
    }
  },
};

</script>

<style>
@import '~@vuepic/vue-datepicker/dist/main.css';
</style>