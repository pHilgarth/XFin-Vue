<template>
  <div class="new-expense">
    <AtomHeadline tag="h1" text="Ausgabe eintragen" />

    <MoleculeLoading v-if="!dataLoaded" :loadingError="loadingError" errorMessage="Fehler beim Laden der Daten!"/>

    <MoleculeExpenseForm v-else-if="bankAccounts.length > 0 && costCenters.length > 0" :bankAccounts="bankAccounts" :costCenters="costCenters"
                         :externalParties="externalParties" :initialBankAccountId="initialBankAccountId" :ibans="bankAccounts.map(b => b.iban)" @save="saveExpense" />

  </div>
</template>

<script>
  import AtomHeadline from '@/components/atoms/AtomHeadline';
  import MoleculeExpenseForm from '@/components/molecules/MoleculeExpenseForm';
  import MoleculeLoading from '@/components/molecules/MoleculeLoading';

  import { CostCenterService } from '@/services/cost-center-service';
  import { ExternalBankAccountService } from '@/services/external-bank-account-service';
  import { ExternalPartyService } from '@/services/external-party-service';
  import { ExternalTransactionService } from '@/services/external-transaction-service';
  import { BankAccountService } from '@/services/bank-account-service';
  import { TransactionService } from '@/services/transaction-service';
  import { NumberService } from '@/services/number-service';

  export default {
    components: {
      AtomHeadline,
      MoleculeExpenseForm,
      MoleculeLoading,
    },

    props: {
      initialBankAccountId: { type: String },
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
        externalParties: null,
        loadingError: false,
      };
    },

    methods: {
      async getData() {
        try {
          const bankAccounts = BankAccountService.getAll();
          const externalParties = ExternalPartyService.getAll();
          const costCenters = CostCenterService.getAll();

          this.bankAccounts = await bankAccounts;
          this.externalParties = await externalParties;

          const costCentersResult = await costCenters;
          this.costCenters = Array.from([
            //TODO - next line only for revenues (NewRevenue)
            //costCentersResult.find(c => c.name === 'Nicht zugewiesen'),
            costCentersResult.filter(c => c.name !== 'Nicht zugewiesen')
          ]).flat();
        } catch (error) {
          throw new Error(error);
        }
      },

      async saveExpense(formData) {
        try {
          let externalBankAccountId = formData.externalParty.externalBankAccount?.id || null;

          if (!formData.externalParty.id) {
            //TODO - check for duplicated ibans in db first! (wait ... i have all externalParties already)
            //TODO - if this creation fails, an error must be thrown (in ExternalPartyService) to prevent further execution of this try block ...
            const newExternalParty = await ExternalPartyService.create(formData.externalParty);
            const newExternalBankAccount = await ExternalBankAccountService.create({
              iban: formData.externalParty.iban,
              bic: formData.externalParty.bic,
              externalPartyId: newExternalParty.id,
            });

            externalBankAccountId = newExternalBankAccount.id;
          }

          //TODO - ... because here I create an external transaction for the possibly newly created external party
          //TODO - also this creation must throw an error to prevent further execution
          const newExternalTransaction = await ExternalTransactionService.create({
            externalBankAccountId: externalBankAccountId,
            dateString: new Date().toISOString(),
            amount: NumberService.parseFloat(formData.amount),
            reference: formData.reference
          });

          await TransactionService.create({
            internalBankAccountId: formData.accountId,
            costCenterId: formData.costCenterId,
            dateString: new Date().toISOString(),
            amount: NumberService.parseFloat(formData.amount) * -1,
            reference: formData.reference,
            transactionToken: newExternalTransaction.counterPartTransactionToken,
            counterPartTransactionToken: newExternalTransaction.transactionToken,
          });

        } catch (error) {
          console.error(error);
        }
      }
    }
  };
</script>