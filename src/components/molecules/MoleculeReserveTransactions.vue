<template>
  <table class="molecule-reserve-transactions">
    <thead>
    <tr>
      <th>Datum</th>
      <th>Verwendungszweck</th>
      <th>Betrag</th>
    </tr>
    </thead>
    <tbody>
    <tr v-for="transaction in transactions" :key="transaction.id">
      <td>{{ formatDate(transaction.date) }}</td>
      <td>{{ transaction.reference }}</td>
      <td :class="transaction.cssClass">{{ `${transaction.cssClass === 'negative' ? '-' : ''}${formatCurrency(transaction.amount)}` }}</td>
    </tr>
    <tr class="table-row-total">
      <td colspan="2">Summe</td>
      <td :class="total < 0 ? 'negative' : ''">{{ formatCurrency(total) }}</td>
    </tr>
    </tbody>
  </table>
</template>

<script>
import { numberService } from '@/services/number-service';

export default {
  props: {
    accountId: { type: Number, required: true },
    transactions: { type: Array, required: true },
  },

  computed: {
    total() {
      return this.transactions.reduce((a, b) => {
        return b.cssClass === 'negative'
            ? a - b.amount :
            a + b.amount;
      }, 0)
    },
  },

  methods: {
    formatCurrency(value) {
      return numberService.formatCurrency(value);
    },

    formatDate(value) {
      return numberService.formatDate(value);
    },
  },

};
</script>