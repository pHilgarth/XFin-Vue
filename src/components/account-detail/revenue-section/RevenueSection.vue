<template>
    <card-component :cardConfig="configureCard()">
        <table>
          <thead>
            <tr>
              <th>Datum</th>
              <th>Quelle</th>
              <th>Verwendungszweck</th>
              <th>Betrag</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="revenue in revenues" :key="revenue.id">
              <td>{{ formatDate(revenue.date) }}</td>
              <td>{{ revenue.counterParty }}</td>
              <td>{{ revenue.reference }}</td>
              <td>{{ formatCurrency(revenue.amount) }}</td>
            </tr>
            <tr v-if="revenues.length === 0">
              <td colspan="4" class="no-revenues">
                Keine Einnahmen vorhanden!
              </td>
            </tr>
            <tr class="subtotal">
              <td colspan="3">Einnahmen gesamt</td>
              <td>{{ getRevenuesSum(true) }}</td>
            </tr>
            <tr class="balance-previous-month">
              <td colspan="3">
                Überschuss Vormonat                
              </td>
              <td :class="{ negative: (Number)(proportionPreviousMonth) < 0}">
                {{ formatCurrency(proportionPreviousMonth) }}
              </td>
            </tr>
            <tr class="total">
              <td colspan="3">
                Budget
              </td>
              <td :class="{ negative: getBudget(false) < 0}">
                {{ getBudget(true) }}
              </td>
            </tr>
          </tbody>
        </table>
      </card-component>
</template>

<script>
import CardComponent from '@/components/_shared/card-component/CardComponent';

import { NumberService } from '@/services/number-service';

export default {
  components: {
    CardComponent
  },

  methods: {
    configureCard() {
      return {
        cardExpanded: false,
        cardHeadline: "Einnahmen",
        cardId: "revenues"
      }
    },

    formatCurrency(value) {
      return NumberService.formatCurrency(value);
    },

    formatDate(value) {
      return NumberService.formatDate(value);
    },

    getBudget(format) {
      if (format) {
        return this.formatCurrency(this.proportionPreviousMonth + this.getRevenuesSum(false));
      }
      else {
        return this.proportionPreviousMonth + this.getRevenuesSum(false);
      }
    },

    getRevenuesSum(formatCurrency) {
      let revenuesTotal = 0;

      this.revenues.forEach(revenue => {
        revenuesTotal += revenue.amount;
      });

      if (formatCurrency) {
        return this.formatCurrency(revenuesTotal);
      }
      else {
        return revenuesTotal;
      }
    },

    updateTable(month) {
      this.$emit('month-switched', month);
    }
  },

  props: {
    proportionPreviousMonth: {
      type: Number,
      required: true
    },
    revenues: {
      type: Array,
      required: true
    }
  }
}

</script>