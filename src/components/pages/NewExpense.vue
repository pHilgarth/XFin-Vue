<template>
  <div class="new-expense">
    <AtomHeadline tag="h1" text="Ausgabe eintragen" />

    <MoleculeLoading v-if="!dataLoaded" :loadingError="loadingError" errorMessage="Fehler beim Laden der Daten!"/>

    <MoleculeExpenseForm v-else :bankAccount="bankAccount" :costCenters="costCenters" :externalParties="externalParties"
                         :duplicatedIban="duplicatedIban" />

  </div>
</template>

<script>
  import AtomHeadline from '@/components/atoms/AtomHeadline';
  import MoleculeExpenseForm from '@/components/molecules/MoleculeExpenseForm';
  import MoleculeLoading from '@/components/molecules/MoleculeLoading';

  import { AccountHolderService } from '@/services/account-holder-service';
  import { BankAccountService } from '@/services/bank-account-service';
  import { CostCenterService } from '@/services/cost-center-service';

  export default {
    components: {
      AtomHeadline,
      MoleculeExpenseForm,
      MoleculeLoading,
    },

    inject: [ 'userId' ],

    props: {
      bankAccountId: { type: String, required: true },
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
        bankAccount: null,
        costCenters: null,
        dataLoaded: false,
        duplicatedIban: false,
        externalParties: null,
        loadingError: false,
      };
    },

    methods: {
      async getData() {
        try {
          const bankAccount = BankAccountService.getSingleById(this.bankAccountId);
          const externalParties = AccountHolderService.getAllByUser(this.userId, true);
          const costCenters = CostCenterService.getAll();

          this.bankAccount = await bankAccount;
          this.externalParties = await externalParties;
          this.externalParties.forEach(e => {
            e.bankAccount = e.bankAccounts[0];
            delete e.bankAccounts;
          });

          const costCentersResult = await costCenters;
          this.costCenters = Array.from([
            //TODO - next line only for revenues (NewRevenue)
            //costCentersResult.find(c => c.name === 'Nicht zugewiesen'),
            costCentersResult.filter(c => c.name !== 'Nicht zugewiesen')
          ]).flat();
        } catch (error) {
          console.error(error);
          throw new Error(error);
        }
      },
    }
  };
</script>