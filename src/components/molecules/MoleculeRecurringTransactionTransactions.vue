<template>
  <table class="molecule-recurring-transaction-transactions">
    <thead>
    <tr>
      <th>Datum</th>
      <th>Betrag</th>
    </tr>
    </thead>
    <tbody>
    <tr v-for="(transaction) in transactions" :key="transaction.id">
      <td>{{ formatDate(transaction.date) }}</td>
      <td>{{ formatCurrency(transaction.amount) }}</td>
    </tr>
    </tbody>
  </table>
</template>

<script>
import { numberService } from '@/services/number-service';

export default {
  props: {
    transactions: { type: Array, required: true },
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