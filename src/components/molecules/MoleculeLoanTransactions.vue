<template>
  <table class="molecule-loan-transaction-table">
    <thead>
      <tr>
        <th>Datum</th>
        <th>Betrag</th>
        <th>Zinsanteil</th>
        <th>Tilgungsanteil</th>
        <th>Restschuld</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(repayment, index) in repayments" :key="index">
        <td>{{ repayment.date }}</td>
        <td>{{ formatCurrency(repayment.amount) }}</td>
        <td>{{ formatCurrency(repayment.rateOfInterest) }}</td>
        <td>{{ formatCurrency(repayment.repaymentAmount) }}</td>
        <td>{{ formatCurrency(repayment.balance) }}</td>
      </tr>
    </tbody>
  </table>
</template>

<script>
import { numberService } from '@/services/number-service';

  export default {
    props: {
      repayments: { type: Array, required: true },
    },

    methods: {
      formatCurrency(value) {
        return numberService.formatCurrency(value);
      },
    },

  };
</script>