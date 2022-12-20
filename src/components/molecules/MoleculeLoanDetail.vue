<template>
  <div class="molecule-loan-detail">
    <div class="molecule-loan-detail__inner">
      <AtomHeadline tag="h1" text="Darlehen-Details" />

      <MoleculeLoading v-if="!dataLoaded" :loadingError="loadingError" errorMessage="Fehler beim Laden des Darlehens!"/>

      <template v-else>
        <MoleculeLoanDetailTable :loan="loan" @update-loan="getData()"/>
        <OrganismCollapsibleWithSlot v-if="loan.repayments.length" title="Transaktionen">
          <MoleculeLoanTransactionsTable :repayments="loan.repayments" />
        </OrganismCollapsibleWithSlot>
      </template>

      <AtomButton type="light" text="Schließen" @click="$emit('close-loan')" />
    </div>
  </div>
</template>

<script>

import AtomButton from '@/components/atoms/AtomButton';
import AtomHeadline from '@/components/atoms/AtomHeadline';

import MoleculeLoading from '@/components/molecules/MoleculeLoading';
import MoleculeLoanDetailTable from '@/components/molecules/MoleculeLoanDetailTable';
import MoleculeLoanTransactionsTable from '@/components/molecules/MoleculeLoanTransactionsTable';

import OrganismCollapsibleWithSlot from '@/components/organisms/OrganismCollapsibleWithSlot';

import { loanService } from '@/services/loan-service';
import { numberService } from '@/services/number-service';

export default {
  components: {
    AtomButton,
    AtomHeadline,
    MoleculeLoading,
    MoleculeLoanDetailTable,
    MoleculeLoanTransactionsTable,
    OrganismCollapsibleWithSlot,
  },

  props: {
    loanId: { type: String, required: true },
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
      dataLoaded: false,
      loadingError: false,
      loan: null,
    };
  },

  methods: {
    async getData() {
      try {
        this.loan = await loanService.getSingleById(this.loanId);
        this.loan.transactions.sort((a, b) => {
          return a.date < b.date ? -1 :
              a.date === b.date ? 0 : 1;
        });

        this.loan.repayments = [];
        let balance = this.loan.amount;

        for (let i = 0; i < this.loan.transactions.length; i++) {
          const transaction = this.loan.transactions[i];
          const repaymentAmount = transaction.amount - (balance * this.loan.rateOfInterest / 100 / 12);
          balance -= repaymentAmount;

          this.loan.repayments.push({
            date: numberService.formatDate(transaction.date),
            amount: transaction.amount,
            rateOfInterest: transaction.amount - repaymentAmount,
            repaymentAmount: repaymentAmount,
            balance: balance,
          });
        }

        this.loan.repayments.reverse();
      }
      catch (error) {
        console.error(error);
      }
    },
  }
}
</script>