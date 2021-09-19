
<template>
  <div class="account-view">
    <AtomHeadline tag="h1" content="Kontenübersicht" />
    <MoleculeLoading v-if="loading || !accountHolders" :loadingError="!loading && !accountHolders" />
    
    <section class="account-view-body" v-else>
      <OrganismCollapsible v-for="accountHolder in accountHolders" :key="accountHolder.id" :config="configureCollapsible(accountHolder)" />
      
      <div style="border:1px solid red;margin: 10px 0;padding:10px 0;font-size:16px;">
        <router-link v-for="accountHolder in accountHolders" :key="accountHolder.id" :to="'/accountHolders/' + accountHolder.id">
          Kontoinhaber bearbeiten
        </router-link>
      </div>


      <div class="account-view-add-account-holder">
        <router-link to="/accountHolders/0" class="xfin-button">
          Kontoinhaber hinzufügen
        </router-link>
      </div>
    </section>
  </div>
</template>

<script>
import AtomHeadline from "@/components/atoms/AtomHeadline";
import MoleculeLoading from "@/components/molecules/MoleculeLoading";
import OrganismCollapsible from "@/components/organisms/OrganismCollapsible";

import { AccountHolderService } from "@/services/account-holder-service";
import { NumberService } from "@/services/number-service";


export default {
  beforeMount() {
    this.getAccountHolders(true);
  },

  components: {
    AtomHeadline,
    MoleculeLoading,
    OrganismCollapsible,
  },

  data() {
    return {
      accountHolders: [],
      loading: true,
    };
  },

  methods: {
    configureCollapsible(accountHolder) {
      return {
          collapsed: true,
          title: accountHolder.name,
          content: {
             component: 'OrganismTable',
             props: {
               config: this.configureTable(accountHolder),
             },
           },
      };
    },

    configureTable(accountHolder) {
      const rows = [];

      accountHolder.bankAccounts.forEach(bankAccount => {
        const balance = this.formatCurrency(bankAccount.balance);
        const negative = bankAccount.balance < 0 ? true : false;

        const row = {
          fields: [
            {
              component: {
                tag: 'router-link',
                content: bankAccount.accountNumber,
              },
              props: { to: `/accounts/${bankAccount.id}` },
            },
            { content: bankAccount.description },
            {
              content: balance,
              props: { class: negative ? 'negative' : '' },
            },
            {
              component: {
                tag: 'MoleculeActionSelect',
              },
              props: {
                config: {
                  bankAccountId: bankAccount.id
                  },
              },
            },
          ],
        };

        rows.push(row);
      });

      return {
        tableHead: {
          fields: [
            { content: 'Konto' },
            { content: 'Kontotyp' },
            { content: 'Kontostand' },
            { content: 'Aktion' },
          ]
        },
        tableBody: {
          rows: rows
        },
      };
    },

    async getAccountHolders(includeAccounts = false) {
      this.accountHolders = await AccountHolderService.getAccountHolders(includeAccounts);
      this.loading = false;
    },

    formatCurrency(value) {
      return NumberService.formatCurrency(value);
    },
  },
};
</script>
