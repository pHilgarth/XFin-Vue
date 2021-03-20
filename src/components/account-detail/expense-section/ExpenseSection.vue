
<template>
    <card-component :cardConfig="configureCard()">
        <table class="expense-view-table">
          <thead>
            <tr>
              <th>Datum</th>
              <th>Kostenstelle</th>
              <th>Zahlungsempfänger</th>
              <th>Typ</th>
              <th>Betrag</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="expense in filteredExpenses" :key="expense.id">
              <td>{{ formatDate(expense.date) }}</td>
              <td>{{ expense.transactionCategory.name }}</td>
              <td>{{ expense.counterPartAccountNumber || expense.externalParty?.name || 'Kontoinitialisierung' }}</td>
              <td>{{ translate(expense.transactionType) }}</td>
              <td>{{ formatCurrency(Math.abs(expense.amount)) }}</td>
            </tr>
            <tr v-if="expenses.length === 0">
              <td colspan="5" class="no-expenses">
                Keine Ausgaben vorhanden!
              </td>
            </tr>
            <tr class="total">
              <td colspan="4">Summe</td>
              <td>{{ expenseSum }}</td>
            </tr>
          </tbody>
        </table>
      </card-component>
</template>

<script>
import CardComponent from '../../_shared/card-component/CardComponent';

import { NumberService } from '../../../services/number-service'; 
import { TranslationService } from '../../../services/translation-service';

export default {
  components: {
    CardComponent
  },

  computed: {
    expenseSum() {
      let expensesTotal = 0;

      this.filteredExpenses.forEach(expense => {
        expensesTotal += Math.abs(expense.amount);
      });

      return this.formatCurrency(expensesTotal);
    },
    filteredExpenses() {
      return this.expenses.filter(e => e.bankAccountNumber !== e.counterPartAccountNumber);
    }
  },

  methods: {
    configureCard() {
      return {
        cardExpanded: false,
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

    translate(value) {
      return TranslationService.translate(value);
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