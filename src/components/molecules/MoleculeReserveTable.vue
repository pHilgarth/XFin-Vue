<template>
  <table class="molecule-reserve-table">
    <thead>
      <tr>
        <th>Titel</th>
        <th>Kostenstelle</th>
        <th>Aktueller Betrag</th>
        <th>Zielbetrag</th>
        <th>Zieldatum</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="reserve in reserves" :key="reserve.id">
        <td>{{ reserve.reference }}</td>
        <td>{{ reserve.costCenter.name }}</td>
        <td>{{ formatCurrency(reserve.currentAmount) }}</td>
        <td>{{ reserve.targetAmount ? formatCurrency(reserve.targetAmount) : '-'}}</td>
        <td>{{ reserve.targetDate ? formatDate(reserve.targetDate) : '-' }}</td>
      </tr>
    </tbody>
  </table>
</template>

<script>

import { numberService } from '@/services/number-service';

export default {
  props: {
    reserves: { type: Array },
  },

  methods: {
    formatDate(value) {
      return numberService.formatDate(value);
    },

    formatCurrency(value) {
      return numberService.formatCurrency(value);
    }
  }
};

</script>
