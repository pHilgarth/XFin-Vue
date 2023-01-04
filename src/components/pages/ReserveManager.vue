<template>
  <section class="reserve-manager">
    <AtomHeadline tag="h1" text="Rücklagen" />
    <MoleculeLoading v-if="!bankAccountsLoaded" :loadingError="bankAccountsLoadingError" errorMessage="Fehler beim Laden der Kontoinhaber!"/>

    <template v-else>
      <div class="pb-4">
        <MoleculeInputAutoSuggest field="bank-account" v-model="bankAccount" label="Konto"
                                  :items="bankAccounts" @itemPicked="pickBankAccount" @blur="onBlurAccount" />
      </div>

      <template v-if="bankAccount">
        <MoleculeLoading v-if="!reservesLoaded" :loadingError="reservesLoadingError" errorMessage="Fehler beim Laden der Rücklagen!"/>

        <template v-else>
          <MoleculeReserveTable class="mb-5" v-if="reservesLoaded && reserves && reserves.length > 0" :reserves="reserves"
                                @show-detail="activateReserveModal" />
          <AtomParagraph v-else text="Keine Rücklagen auf diesem Konto gefunden!" />

        </template>
      </template>

      <AtomButton type="primary" text="Rücklage anlegen" @click.prevent="$router.push('/new-reserve')" />

      <OrganismReserveModal v-if="reserveModalActive" :reserve="selectedReserve" @cancel="reserveModalActive = false" @save="updateReserve"/>
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
import OrganismReserveModal from "@/components/organisms/OrganismReserveModal";

import { accountService } from '@/services/account-service';
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
    OrganismReserveModal,
  },

  watch: {
    async bankAccount() {
      this.reservesLoaded = false;
      this.reservesLoadingError = false;

      try {
        await this.getReserves();

        this.reservesLoaded = true;
      }
      catch (error) {
        this.reservesLoadingError = true;
        console.error(error);
      }
    },
  },

  data() {
    return {
      accountHolders: [],
      accountHolderOptions: null,
      bankAccount: null,
      bankAccounts: null,
      bankAccountsLoaded: false,
      bankAccountsLoadingError: false,
      reserveModalActive: false,
      reserves: null,
      reservesLoaded: false,
      reservesLoadingError: false,
      selectedReserve: null,
    }
  },

  methods: {
    activateReserveModal(reserve) {
      this.reserveModalActive = true;
      this.selectedReserve = reserve;
    },

    calculateCurrentAmount(reserve) {
      let revenuesSum = reserve.revenues.length
          ? reserve.revenues.reduce((a, b) => a + b.amount, 0)
          : 0;

      revenuesSum += reserve.transferRevenues.length
          ? reserve.transferRevenues.reduce((a, b) => a + b.amount, 0)
          : 0;

      let expensesSum = reserve.expenses.length
          ? reserve.expenses.reduce((a, b) => a + b.amount, 0)
          : 0;

      expensesSum += reserve.transferExpenses.length
          ? reserve.transferExpenses.reduce((a, b) => a + b.amount, 0)
          : 0;

      reserve.currentAmount = revenuesSum - expensesSum;
    },

    async getBankAccounts() {
      try {
        let bankAccounts = await accountService.getAll();
        bankAccounts = bankAccounts.filter(b => !b.external).map(
            b => { return { id: b.id, label: `${b.accountHolderName} (${b.iban})`} });

        this.bankAccounts = bankAccounts;
      } catch (error) {
        console.error(error);
        throw new Error(error);
      }
    },

    async getReserves() {
      try {
        this.reserves = await reserveService.getAllByAccount(this.bankAccount.id);

        this.reserves.forEach(r => {
          this.calculateCurrentAmount(r);
        });

      } catch (error) {
        throw new Error(error);
      }
    },

    deactivateReserveModal() {
      this.reserveModalActive = false;
      this.selectedReserve = null;
    },

    onBlurAccount(event) {
      if (this.bankAccount?.label !== event.target.value) {
        this.bankAccount = null;
      }
    },

    pickBankAccount(id) {
      this.bankAccount = this.bankAccounts.find(b => b.id == id);
    },

    async updateReserve(updatedValues) {
      try {
        const jsonPatchDocument = [];

        for (const prop in updatedValues) {
          if (updatedValues[prop] !== this.selectedReserve[prop]) {
            jsonPatchDocument.push({
              op: 'replace',
              path: `/${prop}`,
              value: updatedValues[prop],
            });
          }
        }

        await reserveService.update(this.selectedReserve.id, jsonPatchDocument);

        this.reserveModalActive = false;
        this.selectedReserve = null;

        await this.getReserves();

        this.reservesLoaded = true;
      }
      catch (error) {
        this.reservesLoaded = false;
        this.reservesLoadingError = true;
        console.error(error);
      }
    }
  },
};

</script>