<template>
  <!-- TODO wtf is this className -->
  <div className="transaction-manager">
    <AtomHeadline tag="h1" text="Transaktion"/>

    <MoleculeLoading v-if="!dataLoaded" :loadingError="loadingError" errorMessage="Fehler beim Laden der Daten!"/>

    <template v-else>
      <!-- TODO wtf is this className -->
      <div className="transaction-manager__transaction-direction">
        <MoleculeInputRadioButtons :options="transactionTypes" group="transaction-type" preselectedOptionId="Revenue"
                                   @change="updateTransactionType"/>
      </div>

      <OrganismTransactionFormNew
          :costCenters="costCenters"
          :payerAccounts="payerAccounts"
          :payeeAccounts="payeeAccounts"
          :transactionType="transactionType"
          :initialPayeeAccount="payeeAccount"
          :initialPayerAccount="payerAccount"
          @addExternalParty="showExternalPartyForm = true"
          @saveTransaction="saveTransaction"
          @updatePayeeAccounts="updatePayeeAccounts"
      />

    </template>

    <div v-if="showExternalPartyForm">
      <OrganismExternalPartyModal :ibans="ibans" :names="accountHolderNames" @save="saveExternalParty"
                                  @cancel="showExternalPartyForm = false"/>
    </div>

    <div v-if="showCostCenterAssetForm">
      <OrganismCostCenterAssetForm :names="costCenterAssetNames" :costCenterName="costCenterForAsset.label"
                                   @save="saveCostCenterAsset" @cancel="showCostCenterAssetForm = false"/>
    </div>
  </div>
</template>

<script>
import AtomHeadline from '@/components/atoms/AtomHeadline';
import MoleculeInputRadioButtons from '@/components/molecules/MoleculeInputRadioButtons';
import MoleculeLoading from '@/components/molecules/MoleculeLoading';
import OrganismCostCenterAssetForm from '@/components/organisms/OrganismCostCenterAssetForm';
import OrganismExternalPartyModal from '@/components/organisms/OrganismExternalPartyModal';
import OrganismTransactionFormNew from '@/components/organisms/OrganismTransactionFormNew';

import {accountHolderService} from '@/services/account-holder-service';
import {accountService} from '@/services/account-service';
import {costCenterService} from '@/services/cost-center-service';
import {costCenterAssetService} from '@/services/cost-center-asset-service';
import {loanService} from '@/services/loan-service';
import {recurringTransactionService} from '@/services/recurring-transaction-service';
import {transactionService} from '@/services/transaction-service';

export default {
  components: {
    AtomHeadline,
    MoleculeInputRadioButtons,
    MoleculeLoading,
    OrganismCostCenterAssetForm,
    OrganismExternalPartyModal,
    OrganismTransactionFormNew,
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
      accountHolderNames: null,
      bankAccounts: null,
      costCenters: null,
      dataLoaded: false,
      externalPartyToSave: null,
      ibans: null,
      loadingError: false,
      payeeAccount: null,
      payeeAccounts: null,
      payeeCostCenter: null,
      payeeOrPayer: null,
      payerAccount: null,
      payerAccounts: null,
      payerCostCenter: null,
      showCostCenterAssetForm: false,
      showCostCenterForm: false,
      showExternalPartyForm: false,
      transactionType: 'Revenue',
      transactionTypes: [
        {id: 'Revenue', label: 'Einnahme'},
        {id: 'Expense', label: 'Ausgabe'},
        {id: 'Transfer', label: 'Umbuchung'}
      ],
      user: null,
    }
  },

  methods: {
    async getData() {
      try {
        const bankAccounts = accountService.getAllByUser(this.user.id);
        //TODO - does this work?
        const costCenters = costCenterService.getAllByUser(this.user.id);

        const bankAccountsResult = await bankAccounts;

        this.ibans = bankAccountsResult.map(p => p.iban);
        this.accountHolderNames = bankAccountsResult.map(p => p.accountHolderName);

        //TODO - place this sort function into service
        this.bankAccounts = bankAccountsResult.sort((a, b) => {
          return a.accountHolderName < b.accountHolderName ? -1 :
              a.accountHolderName === b.accountHolderName ? 0 : 1;
        });
        this.payerAccounts = this.bankAccounts
            .filter(b => b.external)
            .map(p => {
              return {id: p.id, label: `${p.accountHolderName} (${p.iban})`, external: p.external}
            });

        this.payeeAccounts = this.bankAccounts
            .filter(b => !b.external)
            .map(p => {
              return {id: p.id, label: `${p.accountHolderName} (${p.iban})`, external: p.external}
            });

        const costCentersResult = await costCenters;

        this.costCenters = costCentersResult.map(p => {
          return {id: p.id, label: p.name}
        });

      } catch (error) {
        console.error(error);
        throw new Error(error);
      }
    },

    //TODO - dont save externalParty immediately in db, only save it, when it's actually used for a transaction, that is, when the user saves the transaction!
    //TODO - same goes for other records, users can create inside transactionForm
    //async saveExternalParty(data) {
    saveExternalParty(data) {
      this.externalPartyToSave = {
        accountHolder: {
          userId: this.user.id,
          name: data.name,
          external: true
        },
        bankAccount: {
          userId: this.user.id,
          iban: data.iban,
          bic: data.bic,
          external: true
        }
      };

      const accountItem = {
        id: 'new',
        label: `${data.name} (${data.iban})`,
        external: true,
        new: true,
      }

      if (this.transactionType === 'Revenue') {
        this.payerAccount = accountItem;
//TODO - this can be simplified (don't use Array.from twice, place it in a function with parameter, that has a value 'payee' oder 'payer')
        this.payerAccounts = Array.from([
          this.payerAccounts.filter(p => !p.new),
          accountItem
        ]).flat().sort((a, b) => {
          return a.label < b.label ? -1 :
              a.label === b.label ? 0 : 1;
        });
      } else if (this.transactionType === 'Expense') {
        this.payeeAccount = accountItem;

        this.payeeAccounts = Array.from([
          this.payeeAccounts.filter(p => !p.new),
          accountItem
        ]).flat().sort((a, b) => {
          return a.label < b.label ? -1 :
              a.label === b.label ? 0 : 1;
        });
      }

      this.showExternalPartyForm = false;
    },

    async saveTransaction(transaction) {
      try {
        if (this.externalPartyToSave) {
          const createdAccountHolder = await accountHolderService.create(this.externalPartyToSave.accountHolder);

          this.externalPartyToSave.bankAccount.accountHolderId = createdAccountHolder.id;

          const createdBankAccount = await accountService.create(this.externalPartyToSave.bankAccount);

          if (this.transactionType === 'Revenue') {
            transaction.sourceBankAccountId = createdBankAccount.id;
          } else if (this.transactionType === 'Expense') {
            transaction.targetBankAccountId = createdBankAccount.id;
          }
        }

        if (this.costCenterAssetToSave) {
          this.costCenterAssetToSave.amount += transaction.amount;
          await costCenterAssetService.create(this.costCenterAssetToSave);
        }

        if (transaction.updateCostCenterAssets) {
          await this.updateCostCenterAssets(transaction);
        }

        if (transaction.reserve) {
          //if it's reserve id has prefix "reserve-"
          transaction.reserveId = transaction.reserve.id.substring(8);
        }

        if (transaction.loan) {
          //TODO - maybe rethink the process of loans (creation, actual receipt, repayment,....)
          const loan = transaction.loan;
          if (loan.creditorBankAccount.id === transaction.sourceBankAccountId) {
            //if the creditor of the selected loan is the source, it's the actual receipt of the loan amount
            //this should only happen once for every loan - multiple receipts per loan is not allowed / should not be allowed
            loan.balance = loan.amount;
          } else if (loan.creditorBankAccount.id === transaction.targetBankAccountId) {
            //if the creditor of the selected loan is the target, it's a repayment and I need to calculate the repaymentAmount
            //because every repayment contains an amount just for the interest
            const repaymentAmount = loan.monthlyInstallment - (loan.balance * loan.rateOfInterest / 100 / 12);

            loan.balance -= repaymentAmount;
          }

          await loanService.update(
              loan.id,
              [{
                op: "replace",
                path: "/balance",
                value: loan.balance
              }],
          );
        }

        if (transaction.isRecurring) {
          await recurringTransactionService.create(transaction);
        }

        await transactionService.create(transaction);

        this.$router.go();
      } catch (error) {
        console.error('Error while saving transaction!')
        console.error(error);
      }
    },

    async updateCostCenterAssets(transaction) {
      if (transaction.sourceCostCenterAsset) {
        const newAmount = transaction.sourceCostCenterAsset.amount -= transaction.amount;
        await costCenterAssetService.update(
            transaction.sourceCostCenterAsset.id,
            [{
              op: "replace",
              path: "/amount",
              value: newAmount
            }],
        )
      }

      if (transaction.targetCostCenterAsset) {
        const newAmount = transaction.targetCostCenterAsset.amount += transaction.amount;
        await costCenterAssetService.update(
            transaction.targetCostCenterAsset.id,
            [{
              op: "replace",
              path: "/amount",
              value: newAmount
            }],
        );
      }
    },

    updatePayeeAccounts(payerAccountId) {
      console.log(`payerAccountId is ${payerAccountId || 'null'}`);

      this.payeeAccounts = payerAccountId
          ? this.payeeAccounts.filter(p => p.id !== payerAccountId)
          : this.bankAccounts
              .filter(b => !b.external)
              .map(p => {
                return {id: p.id, label: `${p.accountHolderName} (${p.iban})`, external: p.external}
              });
    },

    updateTransactionType(event) {
      this.transactionType = event.target.id;

      if (this.transactionType === 'Revenue') {
        this.payerAccounts = this.bankAccounts
            .filter(b => b.external)
            .map(p => {
              return {id: p.id, label: `${p.accountHolderName} (${p.iban})`, external: p.external}
            });

        this.payeeAccounts = this.bankAccounts
            .filter(b => !b.external)
            .map(p => {
              return {id: p.id, label: `${p.accountHolderName} (${p.iban})`, external: p.external}
            });
      } else if (this.transactionType === 'Expense') {
        this.payerAccounts = this.bankAccounts
            .filter(b => !b.external)
            .map(p => {
              return {id: p.id, label: `${p.accountHolderName} (${p.iban})`, external: p.external}
            });

        this.payeeAccounts = this.bankAccounts
            .filter(b => b.external)
            .map(p => {
              return {id: p.id, label: `${p.accountHolderName} (${p.iban})`, external: p.external}
            });
      } else if (this.transactionType === 'Transfer') {
        this.payerAccounts = this.bankAccounts
            .filter(b => !b.external)
            .map(p => {
              return {id: p.id, label: `${p.accountHolderName} (${p.iban})`, external: p.external}
            });

        this.payeeAccounts = this.bankAccounts
            .filter(b => !b.external)
            .map(p => {
              return {id: p.id, label: `${p.accountHolderName} (${p.iban})`, external: p.external}
            });
      }
    }
  }
}
</script>