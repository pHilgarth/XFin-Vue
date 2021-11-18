
<template>
  <div class="account-view">
    <AtomHeadline tag="h1" text="Kontenübersicht" />
    <!-- TODO - general todos -->
    <!-- TODO - check every API call in this app for proper error handling -->
    <!-- TODO - style xfin-button hover effect -->
    <!-- TODO - make use of automatic attribute fallthrough (i.e. dont use classList on Atoms where only one root element is)-->

<!--    <div class="dev-hint important">-->
<!--      <p>Kostenstelle "Nicht zugewiesen:</p>-->
<!--      <p>Diese Kostenstelle dient nur dazu, freies Budget zu "lagern". Einnahmen werden auf "Nicht zugewiesen" gebucht, wenn keine Kostenstelle angegeben wird. <b>TODO</b></p>-->
<!--      <p>Ausgaben von "Nicht zugewiesen" dürfen nicht möglich sein - allerdings gibt es die Möglichkeit, bei einer Ausgabe eine KS auszuwählen und Geld von "Nicht zugewiesen" zu verwenden (via Checkbox "Freies Budget verwenden") <b>TODO</b></p>-->
<!--      <p>intern wird dann Geld auf die ausgewählte KS umgebucht und schließlich damit eine Ausgabe getätigt <b>TODO</b></p>-->
<!--      <br />-->
<!--      <p>Interne Geldtransfers von Konto nach Konto werden über Einnahmen / Ausgaben verbucht - die entsprechenden Forms müssen angepasst werden, damit auch eigene Konten ausgewählt werden können <b>TODO</b></p>-->
<!--      <p>Error Handling fehlt noch weitestgehend, einfach überall nochmal drüber gucken, wo man noch optimieren muss ( vor allem bei den api calls )</p>-->
<!--      <p>Atom Props testen (id, class, additionalProps, etc. ... )</p>-->
<!--      <p>scss und classes prüfen, welche brauche ich, bzw. kann ich die gesetzen classes vereinfachen, etc....</p>-->
<!--      <p>implement smart scss z-indices</p>-->
<!--    </div>-->
    <MoleculeLoading v-if="!dataLoaded" :loadingError="loadingError" errorMessage="Fehler beim Laden der Kontoinhaber!"/>

    <section class="account-view-body" v-else>
      <AtomParagraph class="pb-4" v-if="dataLoaded && accountHolders.length === 0" text="Keine Kontoinhaber gefunden!" />

      <div class="account-view__account-holder" v-for="accountHolder in accountHolders" :key="accountHolder.id">
        <OrganismCollapsible :config="configureCollapsible(accountHolder)" />
        <span class="account-view__edit" :data-id="accountHolder.id" @click="editAccountHolder">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#ffffff" class="bi bi-pencil-fill" viewBox="0 0 16 16">
            <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708l-3-3zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207l6.5-6.5zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.499.499 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11l.178-.178z"/>
          </svg>
        </span>
      </div>
      
      <router-link to="/new-account-holder" class="xfin-button">
        Kontoinhaber hinzufügen
      </router-link>
    </section>
  </div>
</template>

<script>
import AtomHeadline from "@/components/atoms/AtomHeadline";
import AtomParagraph from '@/components/atoms/AtomParagraph';

import MoleculeLoading from "@/components/molecules/MoleculeLoading";

import OrganismCollapsible from "@/components/organisms/OrganismCollapsible";

import { AccountHolderService } from "@/services/account-holder-service";
import { NumberService } from "@/services/number-service";

export default {
  //TODO - try using created hook for API calls
  async created() {
    const apiResponse = await this.getAccountHolders();

    if (apiResponse.success) {
      this.dataLoaded = true;
    }
    else {
      this.loadingError = true;
    }
  },

  components: {
    AtomHeadline,
    AtomParagraph,
    MoleculeLoading,
    OrganismCollapsible,
  },

  data() {
    return {
      dataLoaded: false,
      loadingError: false,

      accountHolders: null,
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

    editAccountHolder(event) {
      let element = event.target;

       while (!element.dataset.id) {
        element = element.parentNode;
      }

      const id = element.dataset.id;

       this.$router.push(`/edit-account-holder/${id}`);
    },

    async getAccountHolders() {
      const includeAccounts = true;
      const apiResponse = await AccountHolderService.getAll(includeAccounts);

      if (apiResponse.success && apiResponse.data) {
        this.accountHolders = apiResponse.data;
      }
      else if (apiResponse.success && !apiResponse.data) {
        this.accountHolders = [];
      }

      return apiResponse;
    },

    formatCurrency(value) {
      return NumberService.formatCurrency(value);
    },
  },
};
</script>
