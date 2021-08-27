<template>
<card-component :cardConfig="configureCard()">
        <table class="budget-view-table">
          <thead>
            <tr>
              <th>Kostenstelle</th>
              <th>Überschuss Vormonat</th>
              <th>Einnahmen</th>
              <th>Budget</th>
              <th>Ausgaben</th>
              <th>Saldo</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="transactionCategory in transactionCategories" :key="transactionCategory.id">
              <td>{{ transactionCategory.name }}</td>
              <td :class="{ negative: (Number)(transactionCategory.proportionPreviousMonth) < 0}">{{ formatCurrency(transactionCategory.proportionPreviousMonth) }}</td>
              <td>{{ formatCurrency(transactionCategory.revenuesTotal) }}</td>
              <td :class="{ negative: (Number)(transactionCategory.budget) < 0 }">{{ formatCurrency(transactionCategory.budget) }}</td>
              <td>{{ formatCurrency(Math.abs(transactionCategory.expensesTotal)) }}</td>
              <td :class="{ negative: (Number)(transactionCategory.balance) < 0 }">{{ formatCurrency(transactionCategory.balance) }}</td>
            </tr>
            <tr class="total">
              <td>Summen</td>
              <td :class="{ negative: getProportionTotal(false) < 0 }">{{ getProportionTotal(true) }}</td>
              <td>{{ getRevenuesTotal(true) }}</td>
              <td :class="{ negative: getBudgetTotal(false) < 0 }">{{ getBudgetTotal(true) }}</td>
              <td >{{ getExpensesTotal() }}</td>
              <td :class="{ negative: getBalanceTotal(false) < 0 }">{{ getBalanceTotal(true) }}</td>
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
          cardHeadline: "Budget",
          cardId: "budget"
        }
      },

        formatCurrency(value) {
          return NumberService.formatCurrency(value)
        },

        getBalanceClass(transactionCategory) {
          return { negative: (Number)(transactionCategory.proportionPreviousMonth) < 0 }
        },

        // getTransactionCategories(month) {
        //     if (!month) {
        //        month = new Date().getMonth();
        //     }

        //     return TransactionCategoryService.getTransactionCategories(this.$route.params.accountNumber, month);
        // },

        getBalanceTotal(format) {
          let balanceTotal = 0;

          this.transactionCategories.forEach(transactionCategory => {
            balanceTotal += transactionCategory.balance;
          });

          if (format) {
            return this.formatCurrency(balanceTotal);
          }
          else {
            return balanceTotal;
          }
        },

        getBudgetTotal(format) {
          let budgetTotal = 0;

          this.transactionCategories.forEach(transactionCategory => {
            budgetTotal += transactionCategory.budget;
          });

          if (format) {
            return this.formatCurrency(budgetTotal);
          }
          else {
            return budgetTotal;
          }
        },

        getExpensesTotal() {
          let expensesTotal = 0;

          this.transactionCategories.forEach(transactionCategory => {
            expensesTotal += Math.abs(transactionCategory.expensesTotal);
          });

          return this.formatCurrency(expensesTotal);
        },

        getProportionTotal(format) {
          let proportionTotal = 0;

          this.transactionCategories.forEach(transactionCategory => {
            proportionTotal += transactionCategory.proportionPreviousMonth;
          });

          if (format) {
            return this.formatCurrency(proportionTotal);
          }
          else {
            return proportionTotal;            
          }
        },

        getRevenuesTotal(format) {
          let revenuesTotal = 0;

          this.transactionCategories.forEach(transactionCategory => {
            revenuesTotal += transactionCategory.revenuesTotal;
          });

          if (format) {
            return this.formatCurrency(revenuesTotal);
          }
          else {
            return revenuesTotal;
          }
        },
    },

    props: {
      transactionCategories: {
        type: Object,
        required: true
      }
    }
}
</script>
