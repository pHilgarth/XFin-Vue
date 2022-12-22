<template>
  <table class="molecule-account-budget-table">
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
        <td>{{ formatCurrency(costCenter.balancePreviousMonth) }}</td>
        <td>{{ formatCurrency(costCenter.revenuesSum) }}</td>
        <td>{{ formatCurrency(costCenter.balancePreviousMonth + costCenter.revenuesSum) }}</td>
        <td>{{ formatCurrency(costCenter.expensesSum) }}</td>
        <td>{{ formatCurrency(costCenter.balance) }}</td>
      </tr>
      <tr class="table-row-total">
        <td>Summen</td>
        <td>{{ formatCurrency(costCenters.reduce((a, b) => a + b.balancePreviousMonth, 0))}}</td>
        <td>{{ formatCurrency(costCenters.reduce((a, b) => a + b.revenuesSum, 0))}}</td>
        <td>{{ formatCurrency(costCenters.reduce((a, b) => a + (b.balancePreviousMonth + b.revenuesSum), 0))}}</td>
        <td>{{ formatCurrency(costCenters.reduce((a, b) => a + b.expensesSum, 0))}}</td>
        <td>{{ formatCurrency(costCenters.reduce((a, b) => a + b.balance, 0))}}</td>
      </tr>
    </tbody>
  </table>
</template>

<script>
import { numberService } from "@/services/number-service";

export default {
  props: {
    costCenters: { type: Array, required: true,
    },
  },

  methods: {
    formatCurrency(value) {
      return numberService.formatCurrency(value);
    },

    formatDate(value) {
      return numberService.formatDate(value);
    },

    configureCollapsible() {
      return {
        collapsed: true,
        title: "Einnahmen",
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

      this.bankAccount.revenues.forEach((revenue) => {
        const row = {
          fields: [
            {
              content: numberService.formatDate(revenue.date),
              props: { class: 'col-3' },
            },
            {
              content: revenue.counterParty,
              props: { class: 'col-3' },
            },
            {
              content: revenue.reference,
              props: { class: 'col-3' },
            },
            {
              content: numberService.formatCurrency(revenue.amount),
              props: { class: 'col-3 align-right' },
            },
          ],
        };

        rows.push(row);
      });

      if (this.bankAccount.revenues.length === 0) {
        rows.push({
          fields: [
            {
              content: "Keine Einnahmen vorhanden!",
              props: {
                colspan: 4,
                class: "text-center",
              },
            },
          ],
        });
      }

      rows.push({
        fields: [
          {
            content: "Einnahmen gesamt",
            props: {
              colspan: 3,
            },
          },
          {
            content: this.getRevenuesSum(true),
            props: { class: 'col-3 align-right' },
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
              content: "Datum",
              props: { class: 'col-3' },
            },
            {
              content: "Quelle",
              props: { class: 'col-3' },
            },
            {
              content: "Verwendungszweck",
              props: { class: 'col-3' },
            },
            {
              content: "Betrag",
              props: { class: 'col-3 align-right' },
            },
          ],
        },
        tableBody: {
          rows: rows,
        },
      };
    },

    getRevenuesSum() {
      let revenuesTotal = 0;

      this.bankAccount.revenues.forEach((revenue) => {
        revenuesTotal += revenue.amount;
      });

      return numberService.formatCurrency(revenuesTotal);
    },
  },
};
</script>