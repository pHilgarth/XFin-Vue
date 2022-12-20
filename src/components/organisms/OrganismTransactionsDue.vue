<template>
  <div class="molecule-transactions-due">
    <h2>Heute fällige Transaktionen</h2>

    <p>beim Swiper darf "margin: 0 auto" nur aktiv sein, wenn mehr Elemente vorhanden als "slides-per-view", damit, die margin links und rechts verschwindet, wenn es kein slider ist (wegen zu wenig Elementen) </p>

    <MoleculeLoading v-if="!dataLoaded" :loadingError="loadingError" errorMessage="Fehler beim Laden der Daten!"/>

    <div v-else class="molecule-transactions-due__swiper">
      <swiper :slides-per-view="3" :space-between="50" navigation grab-cursor class="col-11">
        <swiper-slide v-for="transaction in recurringTransactions" :key="transaction.id" :id="`transaction-${transaction.id}`"
                      :class="`card ${transactionClasses[transaction.id]}`">
          <div class="molecule-transactions-due__wrapper">
            <h5>{{ transaction.responsibleAccountHolder }}</h5>
            <div class="molecule-transactions-due__body">
              <p class="col-12 molecule-transactions-due__counter-part">{{ transaction.counterParty }}</p>
              <p class="col-8">{{ transaction.reference }}</p>
              <p class="col-4 molecule-transactions-due__amount" :class="getAmountClass(transaction)">{{ transaction.amountString }}</p>
              <p class="col-8">Fälligkeitsdatum:</p>
              <p class="col-4">{{ formatDate(transaction.dueDate) }}</p>
            </div>
            <div class="molecule-transactions-due__buttons">
              <AtomButton type="primary-small" text="Bestätigen" @click="animateAndSaveTransaction(transaction, true)" />
              <AtomButton type="cancel-small" text="Verwerfen" @click="animateAndSaveTransaction(transaction, false)" />
              <AtomButton type="light" text="Anpassen" @click="editTransaction(transaction)" class="molecule-transactions-due__edit"/>
            </div>
          </div>
        </swiper-slide>
      </swiper>
    </div>

    <MoleculeRecurringTransactionModal v-if="showTransactionModal" :editOnce="true" :recurringTransaction="recurringTransactionToEdit"
                                       saveText="Verbuchen" @cancel="showTransactionModal = false" @save="animateAndSaveTransaction($event, true)"/>
  </div>
</template>

<script>

import AtomButton from '@/components/atoms/AtomButton';
import MoleculeLoading from '@/components/molecules/MoleculeLoading';
import MoleculeRecurringTransactionModal from "../molecules/MoleculeRecurringTransactionModal";

import { numberService } from '@/services/number-service';
import { recurringTransactionService } from '@/services/recurring-transaction-service';
import { transactionService } from '@/services/transaction-service';

import { Swiper } from "swiper/vue/swiper";
import { SwiperSlide } from "swiper/vue/swiper-slide";
import SwiperCore, { Navigation } from "swiper";

SwiperCore.use([Navigation]);

export default {
  components: {
    AtomButton,
    MoleculeLoading,
    MoleculeRecurringTransactionModal,
    Swiper,
    SwiperSlide,
  },

  async created() {
    try {
      await this.getRecurringTransactions();

      this.dataLoaded = true;
    }
    catch (error) {
      console.error(error);
      this.loadingError = true;
    }
  },

  data() {
    return {
      dataLoaded: false,
      loadingError: false,
      recurringTransactions: null,
      recurringTransactionToEdit: null,
      showTransactionModal: false,
      transactionClasses: {},
    };
  },

  methods: {
    animateAndSaveTransaction(transaction, executed) {
      this.showTransactionModal = false;
      this.transactionClasses[transaction.id] = 'removing';

      console.log(transaction);
      console.log(executed);

      setTimeout(() => this.saveTransaction(transaction, executed), 1000);
    },

    editTransaction(transaction) {
      this.recurringTransactionToEdit = transaction;
      this.showTransactionModal = true;
    },

    formatAccountHolder(account) {
      return `${account.accountHolderName} (${account.accountNumber})`;
    },

    formatAmount(transaction) {
      return `${transaction.targetBankAccount.external ? '-' : ''}${this.formatCurrency(transaction.amount)}`;
    },

    formatCurrency(value) {
      return numberService.formatCurrency(value);
    },

    formatDate(value) {
      return numberService.formatDate(value);
    },

    getAmountClass(transaction) {
      return transaction.targetBankAccount.external
          ? 'negative'
          : !transaction.sourceBankAccount.external
              ? 'negative'
              : 'positive' ;
    },

    async getRecurringTransactions() {
      const today = new Date();

      try {
        this.recurringTransactions = await recurringTransactionService.getAllByDueDate(today);

        this.recurringTransactions.forEach(r => {
          r.responsibleAccountHolder = r.transactionType !== 'Revenue'
              ? this.formatAccountHolder(r.sourceBankAccount)
              : this.formatAccountHolder(r.targetBankAccount);

          r.counterParty = r.transactionType !== 'Revenue'
              ? `an ${this.formatAccountHolder(r.targetBankAccount)}`
              : `von ${this.formatAccountHolder(r.sourceBankAccount)}`;

          r.amountString = r.transactionType !== 'Revenue'
              ? `-${numberService.formatCurrency(r.amount)}`
              : numberService.formatCurrency(r.amount);

          this.transactionClasses[r.id] = '';
        });
      }
      catch (error) {
        console.error(error);
        throw new Error(error);
      }
    },


    async saveTransaction(transaction, executed) {
      try {
        await transactionService.create({
          sourceBankAccountId: transaction.sourceBankAccount.id,
          targetBankAccountId: transaction.targetBankAccount.id,
          sourceCostCenterId: transaction.sourceCostCenter.id,
          targetCostCenterId: transaction.targetCostCenter.id,
          recurringTransactionId: transaction.id,
          reserveId: transaction.reserve?.id,
          loanId: transaction.loan?.id,
          reference: transaction.reference,
          amount: transaction.amount,
          dueDateString: transaction.dueDate,
          dateString: new Date().toISOString(),
          transactionType: transaction.transactionType,
          executed: executed,
        });

        this.transactionClasses[transaction.id] = 'removing';

        await this.getRecurringTransactions();
      }
      catch (error) {
        console.error(error);
      }
    },
  },
};
</script>

<style scoped>
@import "~swiper/swiper.min.css";
@import "~swiper/modules/navigation/navigation.min.css";
</style>