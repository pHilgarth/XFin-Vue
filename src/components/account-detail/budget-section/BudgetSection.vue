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
            <tr v-for="costCenter in costCenters" :key="costCenter.id">
              <td>{{ costCenter.name }}</td>
              <td :class="{ negative: (Number)(costCenter.proportionPreviousMonth) < 0}">{{ formatCurrency(costCenter.proportionPreviousMonth) }}</td>
              <td>{{ formatCurrency(costCenter.revenuesTotal) }}</td>
              <td :class="{ negative: (Number)(costCenter.budget) < 0 }">{{ formatCurrency(costCenter.budget) }}</td>
              <td>{{ formatCurrency(Math.abs(costCenter.expensesTotal)) }}</td>
              <td :class="{ negative: (Number)(costCenter.balance) < 0 }">{{ formatCurrency(costCenter.balance) }}</td>
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
import CardComponent from '../../_shared/card-component/CardComponent';

import { CostCenterService } from '../../../services/cost-center-service';
import { NumberService } from '../../../services/number-service';

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

        getBalanceClass(costCenter) {
          console.log('Bruh');
          return { negative: (Number)(costCenter.proportionPreviousMonth) < 0 }
        },

        getCostCenters(month) {
            if (!month) {
               month = new Date().getMonth();
            }

            return CostCenterService.getCostCenters(this.$route.params.accountNumber, month);
        },

        getBalanceTotal(format) {
          let balanceTotal = 0;

          this.costCenters.forEach(costCenter => {
            balanceTotal += costCenter.balance;
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

          this.costCenters.forEach(costCenter => {
            budgetTotal += costCenter.budget;
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

          this.costCenters.forEach(costCenter => {
            expensesTotal += Math.abs(costCenter.expensesTotal);
          });

          return this.formatCurrency(expensesTotal);
        },

        getProportionTotal(format) {
          let proportionTotal = 0;

          this.costCenters.forEach(costCenter => {
            proportionTotal += costCenter.proportionPreviousMonth;
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

          this.costCenters.forEach(costCenter => {
            revenuesTotal += costCenter.revenuesTotal;
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
      costCenters: {
        type: Object,
        required: true
      }
    }
}
</script>
