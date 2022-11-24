<template>
  <section class="loan-manager">
    <AtomHeadline tag="h1" :text="`Darlehen verwalten (${bankAccount?.accountNumber})`" />

    <MoleculeLoading v-if="!dataLoaded" :loadingError="loadingError" errorMessage="Fehler beim Laden der Daten!" />

    <template v-else>
      <MoleculeNotice v-if="creditorLoans?.length === 0 && debitorLoans?.length === 0" type="info"
                      :text="`Kein Darlehen für Konto ${bankAccount.accountNumber} gefunden!`" />

<!--      <template v-else>-->
<!--        <OrganismCollapsibleWithSlot title="Gläubiger">-->

<!--        </OrganismCollapsibleWithSlot>-->

<!--        <OrganismCollapsibleWithSlot title="Schuldner">-->

<!--        </OrganismCollapsibleWithSlot>-->
<!--      </template>-->

      <AtomButton type="light" text="Darlehen erstellen" @click="showForm = true"/>

      <div v-if="showForm">
        <OrganismLoanForm :costCenters="costCenters" :counterParties="counterParties" @cancel="showForm = false"/>
      </div>

    </template>

  </section>
</template>
<script>

import AtomButton from '@/components/atoms/AtomButton';
import AtomHeadline from '@/components/atoms/AtomHeadline';
import MoleculeLoading from '@/components/molecules/MoleculeLoading';
import MoleculeNotice from '@/components/molecules/MoleculeNotice';
//import OrganismCollapsibleWithSlot from '@/components/organisms/OrganismCollapsibleWithSlot';
import OrganismLoanForm from '@/components/organisms/OrganismLoanForm';

import { accountHolderService } from '@/services/account-holder-service';
import { bankAccountService } from '@/services/bank-account-service';
import { costCenterService } from '@/services/cost-center-service';
import { loanService } from '@/services/loan-service';

export default {
  async created() {
    try {
      await this.getData();
      this.dataLoaded = true;
    } catch (error) {
      this.loadingError = true;
      console.error(error);
    }
  },

  components: {
    AtomButton,
    //OrganismCollapsibleWithSlot,
    AtomHeadline,
    MoleculeLoading,
    MoleculeNotice,
    OrganismLoanForm,
  },

  inject: [ 'userId' ],

  props: {
    bankAccountId: { type: String, required: true },
  },

  data() {
    return {
      accountHolders: null,
      bankAccount: null,
      costCenters: null,
      counterParties: null,
      creditorLoans: null,
      dataLoaded: false,
      loadingError: false,
      debitorLoans: null,
      showForm: false,
    };
  },

  methods: {
    async getData() {
      try {
        const bankAccount = bankAccountService.getSingleById(this.bankAccountId);
        const costCenters = costCenterService.getAll();
        const accountHolders = accountHolderService.getAllByUser(this.userId);
        const externalParties = accountHolderService.getAllByUser(this.userId, true);
        const loans = loanService.getAllByAccount(this.bankAccountId);

        this.bankAccount = await bankAccount;

        const allLoans = await loans;
        this.creditorLoans = allLoans.filter(l => l.creditorBankAccountId === this.bankAccountId);
        this.debitorLoans = allLoans.filter(l => l.debitorBankAccountId === this.bankAccountId);

        const costCentersResult = await costCenters;
        this.costCenters = Array.from([
          costCentersResult.filter(c => c.name !== 'Nicht zugewiesen')
        ]).flat();

        this.counterParties = [ await accountHolders, await externalParties ].flat();
      }
      catch (error) {
        console.error(error);
      }
    },
  },
};

</script>