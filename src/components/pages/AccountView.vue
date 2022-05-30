
<template>
  <div class="account-view">
    <AtomHeadline tag="h1" text="Kontenübersicht" />
    <!-- TODO - general todos -->
    <!-- TODO rework class structure of elements (ie here its .account-form -xfin-account-form) - don't remove this comment before all classes in project are updated, deleted, etc....-->
    <!-- TODO - when refreshing on a component, the first menu entry on the left menu is highlighted as if it were the selected item -->
    <!-- TODO - check every API call in this app for proper error handling -->
    <!-- TODO - style xfin-button hover effect -->
    <!-- TODO - make use of automatic attribute fallthrough (i.e. dont use classList on Atoms where only one root element is)-->
    <!-- TODO - set balance color accordingly on created / drafted account cards when creating a new account holder -->
    <!-- TODO - enable save button OrganismAccountForm only if changes were made -->
    <!-- TODO - enable save button OrganismAccountHolder only if changes were made -->
    <!-- TODO - update api call on UpdateAccountHolder to be equal as the others -->
    <!-- TODO - on account-detail: expenses table: no reference makes the amount appear in the reference column! -->
    <!-- TODO - on account-detail: expenses table: text-align: right on payee column -->
    <!-- TODO - disable budget manager, when no accountHolders are available -->
    <!-- TODO - more information on OrganismTransaction when transactionType == 'expense' (what's the current balance, what's the budget, what's the balance threshold, expenses threshhold, etc... there is place on the right side to display these informations -->
    <!-- TODO - opening the budget manager from an accounts dropdown menu in accountview does not work -->
    <!-- TODO - xfin__form-error on budget-manager "Dieser Posten darf nicht negativ sein" -> it's not position: absolute anymore, but here it has to be -->
    <!--          TODO - i disabled position: absolute because of another component where it shouldn't be absolute -> need to find a solution here -->
    <!-- TODO - dont show "Nicht zugewiesen" in CostCenterManager -->
    <!-- TODO - implement saving of new CostCenter -->
    <!-- TODO - implement custom select form control, so that the options aren't displayed in the default browser dropdown, which is ugly -->
    <!-- TODO - rename transactionCategory to costCenter everywhere -->
    <!-- TODO - rethink the concept of dynamically rendering components by passing a config-prop to components, like in i.e. MoleculeTableBody - no one knows, what shape the config object has ... -->
    <!-- TODO - merge pages NewAccountHolder and UpdateAccountHolder into one component rendering OrganismAccountHolder accordingly-->
    <!-- TODO - move the edit account holder link out of the collapsible title into a section "settings" or else (in main menu sidebar) -->
    <!-- TODO - arrange components in folders: organisms should live in folders named after their parent-components - when they're used multiple times across different components, they live in the folder "shared" - same goes for molecules and atoms -->
    <!-- TODO - rework props declaration on every component like its recommended in the vue styleguide -->
    <!-- TODO - maybe remove "component docs" out of components into a readme or similar -->
    <!-- TODO - rework form classes -> every form should have "xfin__form" and the form-elements "xfin__form__<control|error|label|etc....>" -->
    <!-- TODO - check if there are any classes set, which are not used by CSS and which are NO root-classes used for clarification (component root-classes) -->

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

    <section v-else>
      <AtomParagraph class="pb-4" v-if="dataLoaded && accountHolders.length === 0" text="Keine Kontoinhaber gefunden!" />

      <div class="account-view__account-holder" v-for="accountHolder in accountHolders" :key="accountHolder.id">
        <OrganismCollapsible :config="configureCollapsible(accountHolder)" />
        <AtomEditIcon :data-id="accountHolder.id" @click="editAccountHolder" />
      </div>

      <AtomButton type="light" text="Kontoinhaber hinzufügen" @click.prevent="$router.push('/new-account-holder')" />

    </section>
  </div>
</template>

<script>
import AtomButton from '@/components/atoms/shared/AtomButton';
import AtomHeadline from '@/components/atoms/shared/AtomHeadline';
import AtomEditIcon from '@/components/atoms/shared/AtomEditIcon';
import AtomParagraph from '@/components/atoms/shared/AtomParagraph';

import MoleculeLoading from "@/components/molecules/shared/MoleculeLoading";

import OrganismCollapsible from "@/components/organisms/shared/OrganismCollapsible";

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
    AtomButton,
    AtomHeadline,
    AtomEditIcon,
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
                props: { config: { bankAccount: bankAccount } },
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
