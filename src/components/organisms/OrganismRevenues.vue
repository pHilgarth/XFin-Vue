<template>
  <OrganismCollapsible class="organism-revenues" :config="configureCollapsible()" />
</template>

<script>
import OrganismCollapsible from '@/components/organisms/OrganismCollapsible';

import { NumberService } from "@/services/number-service";

export default {
  components: {
    OrganismCollapsible,
  },

  props: {
      bankAccount: {
          type: Object,
          required: true,
      },
  },

  methods: {
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
              content: NumberService.formatDate(revenue.date),
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
              content: NumberService.formatCurrency(revenue.amount),
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
      
      return NumberService.formatCurrency(revenuesTotal);
    },
  },
};
</script>