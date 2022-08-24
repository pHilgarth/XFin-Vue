<template>
  <section class="loan-manager">
    <AtomHeadline tag="h1" :text="`Darlehen verwalten (${bankAccount?.accountNumber})`" />

    <MoleculeLoading v-if="!dataLoaded" :loadingError="loadingError" errorMessage="Fehler beim Laden der Daten!" />

    <template v-else>
      <MoleculeNotice v-if="!loans || loans.length === 0" type="info" :text="`Kein Darlehen für Konto ${bankAccount.accountNumber} gefunden!`" />

      <template v-else>
        <OrganismCollapsibleWithSlot title="Gläubiger">

        </OrganismCollapsibleWithSlot>

        <OrganismCollapsibleWithSlot title="Schuldner">

        </OrganismCollapsibleWithSlot>
      </template>

      <AtomButton type="light" text="Darlehen erstellen" @click="showForm = true"/>

      <div v-if="showForm">
        <OrganismLoanForm />
      </div>

    </template>

  </section>
</template>
<script>

import AtomButton from '@/components/atoms/AtomButton';
import AtomHeadline from '@/components/atoms/AtomHeadline';
import MoleculeLoading from '@/components/molecules/MoleculeLoading';
import MoleculeNotice from '@/components/molecules/MoleculeNotice';
import OrganismCollapsibleWithSlot from '@/components/organisms/OrganismCollapsibleWithSlot';
import OrganismLoanForm from '@/components/organisms/OrganismLoanForm';

import { BankAccountService } from '@/services/bank-account-service';
import { LoanService } from '@/services/loan-service';

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
    OrganismCollapsibleWithSlot,
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
        const bankAccount = BankAccountService.getSingleById(this.bankAccountId);
        const loans = LoanService.getAllByAccount(this.bankAccountId);

        this.bankAccount = await bankAccount;

        const allLoans = await loans;
        this.creditorLoans = allLoans.filter(l => l.creditorBankAccountId === this.bankAccountId);
        this.debitorLoans = allLoans.filter(l => l.debitorBankAccountId === this.bankAccountId);
      }
      catch (error) {
        console.error(error);
      }
    },
  },
};

</script>