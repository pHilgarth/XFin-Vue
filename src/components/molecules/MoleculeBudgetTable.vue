<template>
  <table class="molecule-budget-table">
    <thead>
      <tr>
        <th>Kostenstelle</th>
        <th>Überschuss Vormonat</th>
        <th>Einnahmen</th>
        <th>Umbuchungen</th>
        <th>Budget</th>
        <th>Ausgaben</th>
        <th>Saldo</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Freies Budget</td>
        <td>{{ formatCurrency(calculateFreeBalancePreviousMonth()) }}</td>
        <td>{{ formatCurrency(calculateFreeRevenues()) }}</td>
        <td>{{ formatCurrency(calculateFreeTransfers()) }}</td>
        <td>{{ formatCurrency(calculateFreeBudget()) }}</td>
        <td>{{ formatCurrency(calculateFreeExpenses()) }}</td>
        <td>{{ formatCurrency(calculateFreeBalance()) }}</td>
      </tr>
      <tr v-for="costCenter in costCenters" :key="costCenter.id">
        <td :class="costCenter.costCenterAssets.length ? 'cost-center-has-assets' : ''">
          <span>{{ costCenter.name }}</span>
          <div v-if="costCenter.costCenterAssets?.length" class="molecule-bugdet-table__assets">
            <span :class="`molecule-budget-table__assets-icon ${activeCostCenterId === costCenter.id ? 'active' : ''}`" @click="toggleAssetOverlay(costCenter.id)">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-down" viewBox="0 0 16 16">
                <path fill-rule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/>
              </svg>
            </span>
            <div :class="`molecule-budget-table__assets-overlay ${activeCostCenterId === costCenter.id ? 'active' : ''}`" :id="`assets-overlay-${costCenter.id}`">
              <div>
                <div class="molecule-budget-table__assets-headline"><strong>Kostenstellen-Posten</strong></div>
                <div class="molecule-budget-table__asset-item molecule-budget-table__asset-item--free">
                  <span class="col-9">Freies Budget</span>
                  <span class="col-3">{{ formatCurrency(calculateFreeCostCenterBudget(costCenter)) }}</span>
                </div>
                <div class="molecule-budget-table__asset-item" v-for="costCenterAsset in costCenter.costCenterAssets" :key="costCenterAsset.id">
                  <span class="col-9">{{ costCenterAsset.name }}</span>
                  <span class="col-3">{{ formatCurrency(costCenterAsset.amount) }}</span>
                </div>
              </div>
            </div>
          </div>
        </td>
        <td>{{ formatCurrency(costCenter.balancePreviousMonth) }}</td>
        <td>{{ formatCurrency(costCenter.revenuesSum) }}</td>
        <td>{{ formatCurrency(costCenter.transferSum) }}</td>
        <td>{{ formatCurrency(costCenter.balancePreviousMonth + costCenter.revenuesSum + costCenter.transferSum) }}</td>
        <td>{{ formatCurrency(costCenter.expensesSum) }}</td>
        <td>{{ formatCurrency(costCenter.balance) }}</td>
      </tr>
      <tr class="table-row-total">
        <td>Summen</td>
        <td>{{ formatCurrency(costCenters.reduce((a, b) => a + b.balancePreviousMonth, 0))}}</td>
        <td colspan="2">{{ formatCurrency(costCenters.reduce((a, b) => a + b.revenuesSum, 0))}}</td>
        <td>{{ formatCurrency(calculateFreeBudget() + costCenters.reduce((a, b) => a + (b.balancePreviousMonth + b.revenuesSum + b.transferSum), 0))}}</td>
        <td>{{ formatCurrency(costCenters.reduce((a, b) => a + b.expensesSum, 0))}}</td>
        <td>{{ formatCurrency(calculateFreeBalance() + costCenters.reduce((a, b) => a + b.balance, 0))}}</td>
      </tr>
    </tbody>
  </table>
</template>

<script>
import { numberService } from "@/services/number-service";

export default {
  data() {
    return {
      activeCostCenterId: null,
    }
  },

  props: {
    bankAccount: { type: Object, required: true },
    costCenters: { type: Array, required: true },
  },

  methods: {
    calculateFreeBalancePreviousMonth() {
      return this.bankAccount.balancePreviousMonth - this.costCenters.reduce((a,b) => a + b.balancePreviousMonth, 0);
    },

    calculateFreeBudget() {
      return (
          this.calculateFreeBalancePreviousMonth() +
          this.calculateFreeRevenues() +
          this.calculateFreeTransfers()
      );
    },

    calculateFreeCostCenterBudget(costCenter) {
      return costCenter.balance - costCenter.costCenterAssets.reduce((a, b) => a + b.amount, 0);
    },

    calculateFreeExpenses() {
      return this.bankAccount.expenses.reduce((a,b) => a + b.amount, 0) - this.costCenters.reduce((a,b) => a + b.expensesSum, 0);
    },

    calculateFreeRevenues() {
      return this.bankAccount.revenues.reduce((a,b) => a + b.amount, 0) - this.costCenters.reduce((a,b) => a + b.revenuesSum, 0);
    },

    calculateFreeBalance() {
      return this.calculateFreeBudget() - this.calculateFreeExpenses();
    },

    calculateFreeTransfers() {
      return 0 - this.costCenters.reduce((a,b) => a + b.transferSum, 0);
    },

    formatCurrency(value) {
      return numberService.formatCurrency(value);
    },

    formatDate(value) {
      return numberService.formatDate(value);
    },

    getRevenuesSum() {
      let revenuesTotal = 0;

      this.bankAccount.revenues.forEach((revenue) => {
        revenuesTotal += revenue.amount;
      });

      return numberService.formatCurrency(revenuesTotal);
    },

    toggleAssetOverlay(costCenterId) {
      this.activeCostCenterId = this.activeCostCenterId === costCenterId ? null : costCenterId;
    }
  },
};
</script>