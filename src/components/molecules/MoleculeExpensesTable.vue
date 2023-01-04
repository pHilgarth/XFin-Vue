<template>
  <table class="molecule-revenues-table">
    <thead>
      <tr>
        <th>Datum</th>
        <th>Kostenstelle</th>
        <th>Zahlungsempfänger</th>
        <th>Verwendungszweck</th>
        <th>Betrag</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="expense in bankAccount.expenses" :key="expense.id">
        <td>{{ formatDate(expense.date) }}</td>
        <td>{{ expense.sourceCostCenterName }}</td>
        <td>{{ expense.targetAccountHolder || '---' }}</td>
        <td>{{ expense.reference }}</td>
        <td>{{ formatCurrency(expense.amount) }}</td>
        <td>{{ expense.isCashTransaction ? 'BAR' : ''}}</td>
      </tr>
      <tr class="table-row-total">
        <td colspan="4">Summe</td>
        <td>{{ formatCurrency(bankAccount.expenses.reduce((a, b) => a + b.amount, 0)) }}</td>
      </tr>
    </tbody>
  </table>
</template>

<script>
import { numberService } from "@/services/number-service";

export default {
  props: {
    bankAccount: {
      type: Object,
      required: true,
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