
<template>
  <OrganismCollapsible :config="configureCard()">
        <table class="expense-view-table">
          <thead>
            <tr>
              <th>Datum</th>
              <th>Kostenstelle</th>
              <th>Zahlungsempfänger</th>
              <th>Verwendungszweck</th>
              <th>Betrag</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="expense in expenses" :key="expense.id">
              <td>{{ formatDate(expense.date) }}</td>
              <td>{{ expense.transactionCategoryName }}</td>
              <td>{{ expense.counterParty }}</td>
              <td>{{ expense.reference }}</td>
              <td>{{ formatCurrency(Math.abs(expense.amount)) }}</td>
            </tr>
            <tr v-if="expenses.length === 0">
              <td colspan="5" class="no-expenses">
                Keine Ausgaben vorhanden!
              </td>
            </tr>
            <tr class="total">
              <td colspan="4">Summe</td>
              <td>{{ getExpensesSum(true) }}</td>
            </tr>
          </tbody>
        </table>
  </OrganismCollapsible>
</template>

<script>
import OrganismCollapsible from '@/components/organisms/OrganismCollapsible';

import { NumberService } from '@/services/number-service';

export default {
  components: {
    OrganismCollapsible
  },

  methods: {
    configureCard() {
      return {
        collapsed: true,
        cardHeadline: "Ausgaben",
        cardId: "expenses-card"
      }
    },

    formatCurrency(value) {
      return NumberService.formatCurrency(value);
    },

    formatDate(value) {
      return NumberService.formatDate(value);
    },

    getExpensesSum(formatCurrency) {
      let expensesTotal = 0;

      this.expenses.forEach(expense => {
        expensesTotal += expense.amount;
      });

      if (formatCurrency) {
        return this.formatCurrency(Math.abs(expensesTotal));
      }
      else {
        return expensesTotal;
      }
    },

    updateTable(month) {
      this.$emit('month-switched', month);
    }
  },

  props: {
    expenses: {
      type: Array,
      required: true
    }
  }
}

</script>