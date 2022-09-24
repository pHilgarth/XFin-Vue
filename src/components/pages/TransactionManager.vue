<template>
  <div class="transaction-manager">
    <AtomHeadline tag="h1" text="Transaktion" />

    <MoleculeLoading v-if="!dataLoaded" :loadingError="loadingError" errorMessage="Fehler beim Laden der Daten!"/>

    <OrganismTransactionForm v-else :initialPayerAccount="payerAccount" :initialPayeeAccount="payeeAccount"
                             :bankAccounts="bankAccounts" :costCenters="costCenters" @addExternalParty="showExternalPartyForm = true" />
    
    <div v-if="showExternalPartyForm">
      <OrganismExternalPartyForm />
    </div>
  </div>
</template>

<script>
import AtomHeadline from '@/components/atoms/AtomHeadline';
import MoleculeLoading from '@/components/molecules/MoleculeLoading';
import OrganismExternalPartyForm from '@/components/organisms/OrganismExternalPartyForm';
import OrganismTransactionForm from '@/components/organisms/OrganismTransactionForm';

import { BankAccountService } from '@/services/bank-account-service';
import { CostCenterService } from '@/services/cost-center-service';

export default {
  components: {
    AtomHeadline,
    MoleculeLoading,
    OrganismExternalPartyForm,
    OrganismTransactionForm,
  },

  props: {
    payerAccount: { type: Object },
    payeeAccount: { type: Object },
  },

  async created() {
    try {
      await this.getData();

      this.dataLoaded = true;
    } catch (error) {
      this.loadingError = true;
    }
  },

  data() {
    return {
      bankAccounts: null,
      costCenters: null,
      dataLoaded: false,
      loadingError: false,
      showExternalPartyForm: false,
    }
  },

  methods: {
    async getData() {
      try {
        const bankAccounts = BankAccountService.getAll();
        const costCenters = CostCenterService.getAll();

        const bankAccountsResult = await bankAccounts;
        //TODO - place sort function into service
        this.bankAccounts = Array.from([
          bankAccountsResult.filter(b => !b.external).sort((a, b) => {
            return a.accountHolderName < b.accountHolderName ? -1 :
                a.accountHolderName === b.accountHolderName ? 0 : 1;
          }),
          bankAccountsResult.filter(b => b.external).sort((a, b) => {
            return a.accountHolderName < b.accountHolderName ? -1 :
                a.accountHolderName === b.accountHolderName ? 0 : 1;
          })
        ]).flat();

        this.costCenters = await costCenters;
      } catch (error) {
        console.error(error);
        throw new Error(error);
      }
    },
  }
}
</script>