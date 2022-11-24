<template>
  <OrganismCollapsible class="organism-budget" :config="configureCollapsible()" />
</template>

<script>
import OrganismCollapsible from '@/components/organisms/OrganismCollapsible';

import { numberService } from "@/services/number-service";

export default {
  components: {
    OrganismCollapsible,
  },

  props: {
    costCenters: {
      type: Array,
      required: true,
    },
  },

  methods: {
    configureCollapsible() {
      return {
        collapsed: true,
        title: "Budget",
        content: [
          {
            component: {
              tag: "OrganismTable",
              props: {
                config: this.configureTable(),
              },
            }
          }
        ],
      };
    },

    configureTable() {
      let rows = [];

      this.costCenters.forEach(category => {
        const row = {
          fields: [
            {
                content: category.name,
                props: { class: 'col-2' },
            },
            {
                content: numberService.formatCurrency(category.proportionPreviousMonth),
                props: { class: (Number)(category.proportionPreviousMonth) < 0 ? 'negative col-3 align-right' : 'col-3 align-right' },
            },
            {
                content: numberService.formatCurrency(category.revenuesTotal),
                props: { class: 'col-2 align-right' },
            },
            {
              content: numberService.formatCurrency(category.internalTransfersAmount),
              props: { class: (Number)(category.internalTransfersAmount) < 0 ? 'negative col-2 align-right' : 'test col-2 align-right' },
            },
            {
                content: numberService.formatCurrency(category.budget),
                props: { class: (Number)(category.budget) < 0 ? 'negative col-2 align-right' : 'col-2 align-right' },
            },
            {
                content: numberService.formatCurrency(Math.abs(category.expensesTotal)),
                props: { class: 'col-2 align-right' },
            },
            {
                content: numberService.formatCurrency(category.balance),
                props: { class: (Number)(category.balance) < 0 ? 'negative col-1 align-right' : 'col-1 align-right' },
            },
          ],
        };

        rows.push(row);
      });

      rows.push({
        fields: [
            {
                content: 'Summen',
                props: { class: 'col-2' },
            },
            {
                content: this.getProportionTotal(true),
                props: { class: this.getProportionTotal(false) < 0 ? 'negative col-3 align-right' : 'col-3 align-right' },
            },
            {
                content: this.getRevenuesTotal(),
                props: { class: 'col-2 align-right' },
            },
            {
                content: ' ',
                props: { class: 'col-2 align-right' },
            },
            {
                content: this.getBudgetTotal(true),
                props: { class: this.getBudgetTotal(false) < 0 ? 'negative col-2 align-right' : 'col-2 align-right' },
            },
            {
                content: this.getExpensesTotal(),
                props: { class: 'col-2 align-right' },
            },
            {
                content: this.getBalanceTotal(true),
                props: { class: this.getBalanceTotal(false) < 0 ? 'negative col-1 align-right' : 'col-1 align-right' }
            },
        ],
        props: {
          class: "total",
        },
      });

      return {
        tableHead: {
          fields: [
            {
                content: "Kostenstelle",
                props: { class: 'col-2' },
            },
            {
                content: "Überschuss Vormonat",
                props: { class: 'col-3 align-right' },
            },
            {
                content: "Einnahmen",
                props: { class: 'col-2 align-right' },
            },
            {
              content: 'Umbuchungen',
              props: { class: 'col-2 align-right' },
            },
            {
                content: "Budget",
                props: { class: 'col-2 align-right' },
            },
            {
                content: "Ausgaben",
                props: { class: 'col-2 align-right' },
            },
            {
                content: "Saldo",
                props: { class: 'col-1 align-right' },
            },
          ],
        },
        tableBody: {
          rows: rows,
        },
      };
    },

    getBalanceTotal(format) {
        let balanceTotal = 0;

        this.costCenters.forEach(costCenter => {
        balanceTotal += costCenter.balance;
        });

        if (format) {
        return numberService.formatCurrency(balanceTotal);
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
            return numberService.formatCurrency(budgetTotal);
        } else {
            return budgetTotal;
        }
    },

    getExpensesTotal() {
        let expensesTotal = 0;

        this.costCenters.forEach(costCenter => {
        expensesTotal += Math.abs(costCenter.expensesTotal);
        });

        return numberService.formatCurrency(expensesTotal);
    },

    getProportionTotal(format) {
        let proportionTotal = 0;

        this.costCenters.forEach(costCenter => {
        proportionTotal += costCenter.proportionPreviousMonth;
        });

        if (format) {
            return numberService.formatCurrency(proportionTotal);
        } else {
            return proportionTotal;            
        }
    },

    getRevenuesTotal() {
        let revenuesTotal = 0;

        this.costCenters.forEach(costCenter => {
        revenuesTotal += costCenter.revenuesTotal;
        });

        return numberService.formatCurrency(revenuesTotal);
    },
  },
};
</script>