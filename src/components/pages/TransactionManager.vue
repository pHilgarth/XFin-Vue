<template>
  <div class="transaction-manager">
    <AtomHeadline tag="h1" text="Transaktion"/>

    <MoleculeLoading v-if="!dataLoaded" :loadingError="loadingError" errorMessage="Fehler beim Laden der Daten!" />

    <template v-else>
      <MoleculeInputRadioButtons :options="transactionDirections" group="transaction-type" preselectedOptionId="revenue" @change="updateTransactionType"/>

      <OrganismTransactionFormNew
          :costCenters="costCenters"
          :payerAccounts="payerAccounts"
          :payeeAccounts="payeeAccounts"
          :transactionDirection="transactionDirection"
          :initialPayeeAccount="payeeAccount"
          :initialPayeeCostCenter="payeeCostCenter"
          :initialPayeeCostCenterAsset="payeeCostCenterAsset"
          :initialPayerAccount="payerAccount"
          :initialPayerCostCenter="payerCostCenter"
          :initialPayerCostCenterAsset="payerCostCenterAsset"
          @addExternalParty="showExternalPartyForm = true"
          @addPayeeCostCenter="addPayeeCostCenter"
          @addPayeeCostCenterAsset="addPayeeCostCenterAsset"
          @addPayerCostCenter="addPayerCostCenter"
          @addPayerCostCenterAsset="addPayerCostCenterAsset" />

<!--      <OrganismTransactionForm :initialPayerAccount="payerAccount" :initialPayeeAccount="payeeAccount"-->
<!--                               :bankAccounts="bankAccounts" :costCenters="costCenters"-->
<!--                               @addExternalParty="showExternalPartyForm = true"/>-->

    </template>

<!--    <pre>{{ externalPartyToSave }}</pre>-->

    <div v-if="showExternalPartyForm">
      <OrganismExternalPartyForm :ibans="ibans" :names="accountHolderNames" @save="saveExternalParty" @cancel="showExternalPartyForm = false" />
    </div>

    <div v-if="showCostCenterForm">
      <OrganismCostCenterForm :names="costCenterNames" @save="saveCostCenter" @cancel="showCostCenterForm = false" />
    </div>

    <div v-if="showCostCenterAssetForm">
      <OrganismCostCenterAssetForm :names="costCenterAssetNames" :costCenterName="costCenterForAsset.label" @save="saveCostCenterAsset" @cancel="showCostCenterAssetForm = false" />
    </div>
  </div>
</template>

<script>
import AtomHeadline from '@/components/atoms/AtomHeadline';
import MoleculeInputRadioButtons from '@/components/molecules/MoleculeInputRadioButtons';
import MoleculeLoading from '@/components/molecules/MoleculeLoading';
import OrganismCostCenterAssetForm from '@/components/organisms/OrganismCostCenterAssetForm';
import OrganismCostCenterForm from '@/components/organisms/OrganismCostCenterForm';
import OrganismExternalPartyForm from '@/components/organisms/OrganismExternalPartyForm';
//import OrganismTransactionForm from '@/components/organisms/OrganismTransactionForm';
import OrganismTransactionFormNew from '@/components/organisms/OrganismTransactionFormNew';

//import { AccountHolderService } from '@/services/account-holder-service';
import {BankAccountService} from '@/services/bank-account-service';
import {costCenterService} from '@/services/cost-center-service';

export default {
  inject: [ 'userId' ],

  components: {
    AtomHeadline,
    MoleculeInputRadioButtons,
    MoleculeLoading,
    OrganismCostCenterAssetForm,
    OrganismCostCenterForm,
    OrganismExternalPartyForm,
    //OrganismTransactionForm,
    OrganismTransactionFormNew,
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
      accountHolderNames: null,
      bankAccounts: null,
      costCenterAssetNames: null,
      costCenterForAsset: null,
      costCenterNames: null,
      costCenters: null,
      costCenterToSave: null,
      costCenterToSelect: null,
      dataLoaded: false,
      externalPartyToSave: null,
      ibans: null,
      loadingError: false,
      payeeAccount: null,
      payeeAccounts: null,
      payeeCostCenter: null,
      payeeCostCenterAsset: null,
      payerAccount: null,
      payerAccounts: null,
      payerCostCenter: null,
      payerCostCenterAsset: null,
      showCostCenterAssetForm: false,
      showCostCenterForm: false,
      showExternalPartyForm: false,
      transactionDirection: 'revenue',

      transactionDirections: [
        {id: 'revenue', label: 'Einnahme'},
        {id: 'expense', label: 'Ausgabe'},
        {id: 'transfer', label: 'Umbuchung'}
      ],
    }
  },

  methods: {
    addPayeeCostCenter() {
      this.costCenterToSelect = 'payeeCostCenter';
      this.showCostCenterForm = true;
    },

    addPayeeCostCenterAsset(costCenter, costCenterAssetNames) {
      this.costCenterForAsset = costCenter;
      this.costCenterToSelect = 'payeeCostCenter';
      this.costCenterAssetNames = costCenterAssetNames;
      this.showCostCenterAssetForm = true;
    },

    addPayerCostCenter() {
      this.costCenterToSelect = 'payerCostCenter';
      this.showCostCenterForm = true;
    },

    addPayerCostCenterAsset(costCenter, costCenterAssetNames) {
      this.costCenterForAsset = costCenter;
      this.costCenterToSelect = 'payerCostCenter';
      this.costCenterAssetNames = costCenterAssetNames;
      this.showCostCenterAssetForm = true;
    },

    async getData() {
      try {
        const bankAccounts = BankAccountService.getAll();
        const costCenters = costCenterService.getAll();

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
            .map(p => { return { id: p.id, label: `${p.accountHolderName} (${p.iban})`, external: p.external} });

        this.payeeAccounts = this.bankAccounts
            .filter(b => !b.external)
            .map(p => { return { id: p.id, label: `${p.accountHolderName} (${p.iban})`, external: p.external} });

        // this.bankAccounts = Array.from([
        //   this.bankAccounts.filter(b => !b.external).sort((a, b) => {
        //     return a.accountHolderName < b.accountHolderName ? -1 :
        //         a.accountHolderName === b.accountHolderName ? 0 : 1;
        //   }),
        //   this.bankAccounts.filter(b => b.external).sort((a, b) => {
        //     return a.accountHolderName < b.accountHolderName ? -1 :
        //         a.accountHolderName === b.accountHolderName ? 0 : 1;
        //   })
        // ]).flat();

        const costCentersResult = await costCenters;
        this.costCenterNames = costCentersResult.map(c => c.name);

        this.costCenters = costCentersResult
            .filter(c => c.name !== 'Nicht zugewiesen')
            .map(p => { return { id: p.id, label: p.name } });

      } catch (error) {
        console.error(error);
        throw new Error(error);
      }
    },

    saveCostCenter(name) {
      this.costCenterToSave = {
        name: name,
      }

      const costCenterItem = {
        id: 'new',
        label: name,
        new: true,
      }

      this.costCenters = Array.from([
        this.costCenters.filter(p => !p.new ),
        costCenterItem
      ]).flat().sort((a, b) => {
        return a.label < b.label ? -1 :
            a.label === b.label ? 0 : 1;
      });

      if (this.transactionDirection === 'expense') {
        this.payerCostCenter = costCenterItem;
      }
      else if (this.transactionDirection === 'revenue') {
        this.payeeCostCenter = costCenterItem;
      }
      else if (this.transactionDirection === 'transfer') {
        this[this.costCenterToSelect] = costCenterItem;
      }

      this.showCostCenterForm = false;
    },

    saveCostCenterAsset(name) {
      this.costCenterAssetToSave = {
        name: name,
        costCenterId: this.costCenterForAsset.id
      };

      this[`${this.costCenterToSelect}Asset`] = {
        id: 'new',
        label: name,
        new: true,
      };

      this.showCostCenterAssetForm = false;
    },

    //TODO - dont save externalParty immediately in db, only save it, when it's actually used for a transaction, that is, when the user saves the transaction!
    //TODO - same goes for other records, users can create inside transactionForm
    //async saveExternalParty(data) {
    saveExternalParty(data) {
      this.externalPartyToSave = {
        accountHolder: {
          userId: this.userId,
          name: data.name,
          external: true
        },
        bankAccount: {
          iban: data.iban,
          bic: data.bic,
          external: true
        }
      }

      const accountItem = {
        id: 'new',
        label: `${data.name} (${data.iban})`,
        external: true,
        new: true,
      }

      if (this.transactionDirection === 'revenue') {
        this.payerAccount = accountItem;

        this.payerAccounts = Array.from([
            this.payerAccounts.filter(p => !p.new ),
            accountItem
        ]).flat().sort((a, b) => {
          return a.label < b.label ? -1 :
              a.label === b.label ? 0 : 1;
        });
      }

      else if(this.transactionDirection === 'expense') {
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

      // try {
      //   const createdAccountHolder = await AccountHolderService.create({ userId: this.userId, name: data.name, external: true });
      //   const createdBankAccount = await BankAccountService.create({ accountHolderId: createdAccountHolder.id, iban: data.iban, bic: data.bic, external: true });
      //
      //   const accountHolderItem = {
      //     id: createdAccountHolder.id,
      //     label: `${createdAccountHolder.name} (${createdBankAccount.iban})`,
      //     external: true,
      //   };
      //
      //   this.showExternalPartyForm = false;
      //
      //   if (this.transactionDirection === 'revenue') {
      //     this.payerAccounts = Array.from([
      //         this.payerAccounts,
      //         accountHolderItem
      //     ]).flat().sort((a, b) => {
      //       return a.label < b.label ? -1 :
      //           a.label === b.label ? 0 : 1;
      //     });
      //   }
      //   else if(this.transactionDirection === 'expense') {
      //     this.payeeAccounts = Array.from([
      //       this.payeeAccounts,
      //       accountHolderItem
      //     ]).flat().sort((a, b) => {
      //       return a.label < b.label ? -1 :
      //           a.label === b.label ? 0 : 1;
      //     });
      //   }
      //
      // } catch(error) {
      //   console.error(error);
      //   alert(error + ' - show something in frontend');
      // }
    },

    updateTransactionType(event) {
      this.transactionDirection = event.target.id;

      if (this.transactionDirection === 'revenue') {
        this.payerAccounts = this.bankAccounts
            .filter(b => b.external)
            .map(p => { return { id: p.id, label: `${p.accountHolderName} (${p.iban})`, external: p.external} });

        this.payeeAccounts = this.bankAccounts
            .filter(b => !b.external)
            .map(p => { return { id: p.id, label: `${p.accountHolderName} (${p.iban})`, external: p.external} });
      }
      else if (this.transactionDirection === 'expense') {
        this.payerAccounts = this.bankAccounts
            .filter(b => !b.external)
            .map(p => { return { id: p.id, label: `${p.accountHolderName} (${p.iban})`, external: p.external} });

        this.payeeAccounts = this.bankAccounts
            .filter(b => b.external)
            .map(p => { return { id: p.id, label: `${p.accountHolderName} (${p.iban})`, external: p.external} });
      }
      else if (this.transactionDirection === 'transfer') {
        this.payerAccounts = this.bankAccounts
            .filter(b => !b.external)
            .map(p => { return { id: p.id, label: `${p.accountHolderName} (${p.iban})`, external: p.external} });

        this.payeeAccounts = this.bankAccounts
            .filter(b => !b.external)
            .map(p => { return { id: p.id, label: `${p.accountHolderName} (${p.iban})`, external: p.external} });
      }
    }
  }
}
</script>