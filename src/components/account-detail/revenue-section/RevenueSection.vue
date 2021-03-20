
<template>
    <card-component :cardConfig="configureCard()">
        <table>
          <thead>
            <tr>
              <th>Datum</th>
              <th>Quelle</th>
              <th>Typ</th>
              <th>Betrag</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="revenue in filteredRevenues" :key="revenue.id">
              <td>{{ formatDate(revenue.date) }}</td>
              <td>{{ revenue.counterPartAccountNumber || revenue.externalParty?.name || 'Kontoinitialisierung' }}</td>
              <td>{{ translate(revenue.transactionType) }}</td>
              <td>{{ formatCurrency(revenue.amount) }}</td>
            </tr>
            <tr v-if="filteredRevenues.length === 0">
              <td colspan="4" class="no-revenues">
                Keine Einnahmen vorhanden!
              </td>
            </tr>
            <tr class="subtotal">
              <td colspan="3">Einnahmen gesamt</td>
              <td>{{ getRevenueSum(true) }}</td>
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
import CardComponent from '../../_shared/card-component/CardComponent';

import { NumberService } from '../../../services/number-service';
import { TranslationService } from '../../../services/translation-service';

export default {
  components: {
    CardComponent
  },

  computed: {
    filteredRevenues() {
      return this.revenues.filter(r => r.bankAccountNumber !== r.counterPartAccountNumber);
    }
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
        return this.formatCurrency(this.proportionPreviousMonth + this.getRevenueSum(false));
      }
      else {
        return this.proportionPreviousMonth + this.getRevenueSum(false);
      }
    },

    getRevenueSum(formatCurrency) {
      let revenuesTotal = 0;

      this.filteredRevenues.forEach(revenue => {
        revenuesTotal += revenue.amount;
      });

      if (formatCurrency) {
        return this.formatCurrency(revenuesTotal);
      }
      else {
        return revenuesTotal;
      }
    },

    translate(value) {
      return TranslationService.translate(value);
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