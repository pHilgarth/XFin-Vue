<template>
  <table class="molecule-overheads-table">
    <thead>
      <tr>
        <th>Verwendungszweck</th>
        <th>Kostenstelle</th>
        <th>Zahlungsempfänger</th>
        <th>Abbuchungstag</th>
        <th>Betrag</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="overheadsItem in overheads" :key="overheadsItem.id">
        <td>{{ overheadsItem.reference }}</td>
        <td>{{ overheadsItem.sourceCostCenter.name }}</td>
        <td>{{ overheadsItem.targetBankAccount.accountHolderName }}</td>
        <td>{{ overheadsItem.dayOfMonth}}.</td>
        <td>{{ formatCurrency(overheadsItem.amount) }}</td>
      </tr>
    </tbody>
  </table>
</template>

<script>
  import { numberService } from '@/services/number-service';

  export default {
    props: {
      overheads: { type: Array, required: true },
    },

    methods: {
      formatCurrency(value) {
        return numberService.formatCurrency(value);
      },
    },
  };
</script>