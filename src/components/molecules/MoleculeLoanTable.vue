<template>
  <div class="molecule-loan-table">
    <table>
      <thead>
      <tr>
        <th>Verwendungszweck</th>
        <th>Betrag</th>
        <th>Getilgter Betrag</th>
        <th>Offener Betrag</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="loan in loans" :key="loan.id">
        <td class="molecule-loan-table__reference" @click="$emit('show-loan', loan.id)">{{ loan.reference }}</td>
        <td>{{ formatCurrency(loan.amount) }}</td>
        <td>{{ formatCurrency(loan.amount - loan.balance) }}</td>
        <td>{{ formatCurrency(loan.balance) }}</td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import {numberService} from '@/services/number-service';

export default {
  emits: [ 'show-loan' ],

  props: {
    loans: {type: Array, required: true},
  },

  methods: {
    formatCurrency(value) {
      return numberService.formatCurrency(value);
    }
  }
}
</script>