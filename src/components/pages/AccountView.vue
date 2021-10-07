
<template>
  <div class="account-view">
    <OrganismNewAccountHolder v-if="modalOpened" @close="modalOpened = false" />
    <AtomHeadline tag="h1" content="Kontenübersicht" />
    <div class="dev-hint important">
      <p>Kostenstelle "Nicht zugewiesen:</p>
      <p>Diese Kostenstelle dient nur dazu, freies Budget zu "lagern". Einnahmen werden auf "Nicht zugewiesen" gebucht, wenn keine Kostenstelle angegeben wird. <b>TODO</b></p>
      <p>Ausgaben von "Nicht zugewiesen" dürfen nicht möglich sein - allerdings gibt es die Möglichkeit, bei einer Ausgabe eine KS auszuwählen und Geld von "Nicht zugewiesen" zu verwenden (via Checkbox "Freies Budget verwenden") <b>TODO</b></p>
      <p>intern wird dann Geld auf die ausgewählte KS umgebucht und schließlich damit eine Ausgabe getätigt <b>TODO</b></p>
      <br />
      <p>Interne Geldtransfers von Konto nach Konto werden über Einnahmen / Ausgaben verbucht - die entsprechenden Forms müssen angepasst werden, damit auch eigene Konten ausgewählt werden können <b>TODO</b></p>
      <p>Error Handling fehlt noch weitestgehend, einfach überall nochmal drüber gucken, wo man noch optimieren muss ( vor allem bei den api calls )</p>
      <p>Atom Props testen (id, class, additionalProps, etc. ... )</p>
      <p>scss und classes prüfen, welche brauche ich, bzw. kann ich die gesetzen classes vereinfachen, etc....</p>
      <p>implement smart scss z-indices</p>
    </div>
    <MoleculeLoading v-if="loading || !accountHolders" :loadingError="!loading && !accountHolders" />
    
    <section class="account-view-body" v-else>
      <OrganismCollapsible v-for="accountHolder in accountHolders" :key="accountHolder.id" :config="configureCollapsible(accountHolder)" />
      
      <div style="border:1px solid red;margin: 10px 0;padding:10px 0;font-size:16px;">
        <router-link v-for="accountHolder in accountHolders" :key="accountHolder.id" :to="'/accountHolders/' + accountHolder.id">
          Kontoinhaber bearbeiten
        </router-link>
      </div>

      <router-link to="/new-account-holder">
        Kontoinhaber hinzufügen
      </router-link>

      <div class="form-floating mb-3">
        <input type="email" class="form-control" id="floatingInput" placeholder="name@example.com">
        <label for="floatingInput">Email address</label>
      </div>
      <div class="form-floating">
        <input type="password" class="form-control" id="floatingPassword" placeholder="Password">
        <label for="floatingPassword">Password</label>
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
  //TODO - try using created hook for API calls
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
      modalOpened: false,
    };
  },

  methods: {
    configureCollapsible(accountHolder) {
      return {
          collapsed: true,
          title: accountHolder.name,
          content: [
            {
              component: {
                tag: 'OrganismTable',
                props: {
                  config: this.configureTable(accountHolder),
                },
              }
            }
          ],
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
                props: { to: `/accounts/${bankAccount.id}` },
              },
            },
            { content: bankAccount.description },
            {
              content: balance,
              props: { class: negative ? 'negative' : '' },
            },
            {
              component: {
                tag: 'MoleculeActionSelect',
                props: { config: { bankAccountId: bankAccount.id } },
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
      this.accountHolders = await AccountHolderService.getAll(includeAccounts);
      this.loading = false;
    },

    formatCurrency(value) {
      return NumberService.formatCurrency(value);
    },
  },
};
</script>
