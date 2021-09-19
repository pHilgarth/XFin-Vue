<template>
  <OrganismCollapsible :config="configureCollapsible()" />
</template>

<script>
import OrganismCollapsible from "@/components/organisms/OrganismCollapsible";

import { NumberService } from "@/services/number-service";

export default {
  components: {
    OrganismCollapsible,
  },

  props: {
    transactionCategories: {
      type: Array,
      required: true,
    },
  },

  methods: {
    configureCollapsible() {
      return {
        collapsed: true,
        title: "Budget",
        content: {
          component: "OrganismTable",
          props: {
            config: this.configureTable(),
          },
        },
      };
    },

    configureTable() {
      let rows = [];

      this.transactionCategories.forEach(category => {
        const row = {
          fields: [
            {
                content: category.name,
                props: { class: 'col-2' },
            },
            {
                content: NumberService.formatCurrency(category.proportionPreviousMonth),
                props: { class: (Number)(category.proportionPreviousMonth) < 0 ? 'negative col-3 align-right' : 'col-3 align-right' },
            },
            {
                content: NumberService.formatCurrency(category.revenuesTotal),
                props: { class: 'col-2 align-right' },
            },
            {
                content: NumberService.formatCurrency(category.budget),
                props: { class: (Number)(category.budget) < 0 ? 'negative col-2 align-right' : 'col-2 align-right' },
            },
            {
                content: NumberService.formatCurrency(Math.abs(category.expensesTotal)),
                props: { class: 'col-2 align-right' },
            },
            {
                content: NumberService.formatCurrency(category.balance),
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

        this.transactionCategories.forEach(transactionCategory => {
        balanceTotal += transactionCategory.balance;
        });

        if (format) {
        return NumberService.formatCurrency(balanceTotal);
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
            return NumberService.formatCurrency(budgetTotal);
        } else {
            return budgetTotal;
        }
    },

    getExpensesTotal() {
        let expensesTotal = 0;

        this.transactionCategories.forEach(transactionCategory => {
        expensesTotal += Math.abs(transactionCategory.expensesTotal);
        });

        return NumberService.formatCurrency(expensesTotal);
    },

    getProportionTotal(format) {
        let proportionTotal = 0;

        this.transactionCategories.forEach(transactionCategory => {
        proportionTotal += transactionCategory.proportionPreviousMonth;
        });

        if (format) {
            return NumberService.formatCurrency(proportionTotal);
        } else {
            return proportionTotal;            
        }
    },

    getRevenuesTotal() {
        let revenuesTotal = 0;

        this.transactionCategories.forEach(transactionCategory => {
        revenuesTotal += transactionCategory.revenuesTotal;
        });

        return NumberService.formatCurrency(revenuesTotal);
    },
  },
};
</script>