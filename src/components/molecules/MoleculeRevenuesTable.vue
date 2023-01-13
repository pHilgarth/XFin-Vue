<template>
  <table class="molecule-revenues-table">
    <thead>
      <tr>
        <th>Datum</th>
        <th>Quelle</th>
        <th>Verwendungszweck</th>
        <th>Betrag</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      <tr v-if="!bankAccount.revenues.length">
        <td colspan="5">
          <AtomParagraph class="text-center pt-2" text="Keine Einnahmen vorhanden!" />
        </td>
      </tr>
      <tr v-for="revenue in bankAccount.revenues" :key="revenue.id">
        <td>{{ formatDate(revenue.date) }}</td>
        <td>{{ revenue.sourceAccountHolder || '---' }}</td>
        <td>{{ revenue.reference }}</td>
        <td>{{ formatCurrency(revenue.amount) }}</td>
        <td>{{ revenue.isCashTransaction ? 'BAR' : ''}}</td>
      </tr>
      <tr v-if="bankAccount.revenues.length" class="table-row-total">
        <td colspan="3">Summe</td>
        <td>{{ formatCurrency(bankAccount.revenues.reduce((a, b) => a + b.amount, 0)) }}</td>
      </tr>
    </tbody>
  </table>
</template>

<script>
import AtomParagraph from "@/components/atoms/AtomParagraph";

import { numberService } from "@/services/number-service";

export default {
  components: {
    AtomParagraph,
  },

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