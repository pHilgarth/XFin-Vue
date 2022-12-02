<template>
  <section class="reserve-manager">
    <AtomHeadline tag="h1" text="Rücklagen" />
    <MoleculeLoading v-if="!bankAccountsLoaded" :loadingError="bankAccountsLoadingError" errorMessage="Fehler beim Laden der Kontoinhaber!"/>

    <template v-else>
      <div class="pb-5">
        <MoleculeInputAutoSuggest field="bank-account" v-model="bankAccount" label="Konto"
                                  :items="bankAccounts" @itemPicked="pickBankAccount" />
      </div>

      <template v-if="bankAccount">
        <MoleculeLoading v-if="!reservesLoaded" :loadingError="reservesLoadingError" errorMessage="Fehler beim Laden der Rücklagen!"/>

        <template v-else>
          <MoleculeReserveTable v-if="reservesLoaded && reserves && reserves.length > 0" :reserves="reserves" />
          <AtomParagraph v-else text="Keine Rücklagen auf diesem Konto gefunden!" />

        </template>
      </template>
      <AtomParagraph v-else-if="selectedAccountHolderId > 0" text="Keine Rücklagen vorhanden!"/>
      <AtomButton type="primary" text="Rücklage erstellen" @click.prevent="$router.push('/new-reserve')" />
    </template>
  </section>
</template>

<script>
import AtomButton from '@/components/atoms/AtomButton';
import AtomHeadline from '@/components/atoms/AtomHeadline';
import AtomParagraph from '@/components/atoms/AtomParagraph';
import MoleculeInputAutoSuggest from '@/components/molecules/MoleculeInputAutoSuggest';
import MoleculeLoading from '@/components/molecules/MoleculeLoading';
import MoleculeReserveTable from "@/components/molecules/MoleculeReserveTable";

import { bankAccountService } from '@/services/bank-account-service';
import { reserveService } from '@/services/reserve-service';

export default {
  async created() {
    try {
      await this.getBankAccounts();

      this.bankAccountsLoaded = true;
    } catch (error) {
      this.bankAccountsLoadingError = true;
    }
  },

  components: {
    AtomParagraph,
    AtomButton,
    AtomHeadline,
    MoleculeInputAutoSuggest,
    MoleculeLoading,
    MoleculeReserveTable,
  },

  data() {
    return {
      accountHolders: [],
      accountHolderOptions: null,
      bankAccount: null,
      bankAccounts: null,
      bankAccountsLoaded: false,
      bankAccountsLoadingError: false,
      reserves: null,
      reservesLoaded: false,
      reservesLoadingError: false,
    }
  },

  methods: {
    calculateCurrentAmount(reserve) {
      const revenuesSum = reserve.revenues.length
          ? reserve.revenues.reduce((a, b) => a + b.amount, 0)
          : 0;

      const expensesSum = reserve.expenses.length
          ? reserve.expenses.reduce((a, b) => a + b.amount, 0)
          : 0;

      reserve.currentAmount = revenuesSum - expensesSum;
    },

    async getBankAccounts() {
      try {
        let bankAccounts = await bankAccountService.getAll();
        bankAccounts = bankAccounts.filter(b => !b.external).map(
            b => { return { id: b.id, label: `${b.accountHolderName} (${b.iban})`} });

        this.bankAccounts = bankAccounts;
      } catch (error) {
        console.error(error);
        throw new Error(error);
      }
    },

    pickBankAccount(id) {
      this.bankAccount = this.bankAccounts.find(b => b.id == id);
    },
  },

  watch: {
    async bankAccount() {
      this.reservesLoaded = false;
      this.reservesLoadingError = false;

      try {
        this.reserves = await reserveService.getAllByAccount(this.bankAccount.id);

        this.reserves.forEach(r => {
          this.calculateCurrentAmount(r);
        });

        this.reservesLoaded = true;
      } catch (error) {
        this.reservesLoadingError = true;
        console.error(error);
      }
    },
  }
};

</script>