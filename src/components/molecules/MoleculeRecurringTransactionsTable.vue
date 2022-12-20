<template>
  <table class="molecule-recurring-transaction-table">
    <thead>
      <tr>
        <th>Verwendungszweck</th>
        <th>Kostenstelle</th>
        <th>{{ counterParty }}</th>
        <th>Ausführung ab</th>
        <th>Ausführung bis</th>
        <th>Fällig am</th>
        <th>Betrag</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="transaction in recurringTransactions" :key="transaction.id" :class="new Date(transaction.startDate) > new Date() ? 'molecule-recurring-transaction-table__scheduled' : ''">
        <td class="molecule-recurring-transaction-table__reference" @click="$emit('show-detail', transaction)">{{ transaction.reference }}</td>
        <td>{{ transaction.sourceCostCenter.name }}</td>
        <td>{{ transaction.sourceBankAccount.accountHolderName }}</td>
        <td>{{ formatDate(transaction.startDate) }}</td>
        <td>{{ formatDate(transaction.endDate) }}</td>
        <td>{{ transaction.dayOfMonth}}.</td>
        <td>{{ formatCurrency(transaction.amount) }}</td>
      </tr>
    </tbody>
  </table>
</template>

<script>
  import { numberService } from '@/services/number-service';

  export default {
    props: {
      counterParty: { type: String, required: true },
      recurringTransactions: { type: Array, required: true },
    },

    methods: {
      formatDate(value) {
        return numberService.formatDate(value);
      },

      formatCurrency(value) {
        return numberService.formatCurrency(value);
      },
    },
  };
</script>