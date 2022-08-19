<template>
  <div class="account-view">
    <AtomHeadline tag="h1" text="Kontenübersicht" />
    <!-- TODO - general todos -->
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
    <!-- TODO - opening the budget manager from an accounts dropdown menu in accountview does not work -->
    <!-- TODO - xfin__form-error on budget-manager "Dieser Posten darf nicht negativ sein" -> it's not position: absolute anymore, but here it has to be -->
    <!--          TODO - i disabled position: absolute because of another component where it shouldn't be absolute -> need to find a solution here -->
    <!-- TODO - dont show "Nicht zugewiesen" in CostCenterManager -->
    <!-- TODO - implement saving of new CostCenter -->
    <!-- TODO - implement custom select form control, so that the options aren't displayed in the default browser dropdown, which is ugly -->
    <!-- TODO - rethink the concept of dynamically rendering components by passing a config-prop to components, like in i.e. MoleculeTableBody - no one knows, what shape the config object has ... -->
    <!-- TODO - merge pages NewAccountHolder and UpdateAccountHolder into one component rendering OrganismAccountHolder accordingly-->
    <!-- TODO - move the edit account holder link out of the collapsible title into a section "settings" or else (in main menu sidebar) -->
    <!-- TODO - arrange components in folders: organisms should live in folders named after their parent-components - when they're used multiple times across different components, they live in the folder "shared" - same goes for molecules and atoms -->
    <!-- TODO - rework props declaration on every component like its recommended in the vue styleguide -->
    <!-- TODO - maybe remove "component docs" out of components into a readme or similar -->
    <!-- TODO - rework form classes -> every form should have "xfin__form" and the form-elements "xfin__form__<control|error|label|etc....>" -->
    <!-- TODO - check if there are any classes set, which are not used by CSS and which are NO root-classes used for clarification (component root-classes) -->
    <!-- TODO - write a service that removes <script>-tags from text that is used in v-html somewhere -->
    <!-- TODO - implement detail view on budget manager (to see how the money on a given cost center is allocated on a given account) -> see comments on MoleculeBudgetManagerCategory -->
    <!-- TODO - styling ... (SCSS styling of the app) -->
    <!-- TODO - add padding-classes to every molecule, atom, etc .... check every form and add it where its missing -->
    <!-- TODO - add "this.iban = this.iban.toUpperCase();" to every iban and bic field watcher in other components and remove 'toUpperCase' afterwards where it's no longer needed -->
    <!-- TODO - if no changes are made to account, disable save-button (on OrganismAccountForm) -->
    <!-- TODO - check if position:absolute directly on .form-error has some drawbacks somewhere -->
    <!-- TODO - OrganismTransaction: MoleculeInputAutoSuggest wont close -> reproduce: type something in - click 'add new' - type more in - blur it using tab -->
    <!-- TODO - dont place the accountId in the url in 'NewRevenue' or 'NewExpense' - just preselect the account from where the user is coming -->
    <!-- TODO - creation of transaction does not work - try to add a reference and set breakpoint in the API, external transaction is created, but no internal transaction -> there is an frontend error in console -->
    <!-- TODO - do I need the components in main.js globally? (OrganismBudgetList, OrganismTable, MoleculeActionSelect) -->
    <!-- TODO - maybe include a way to update externalBankAccount data? -->
    <!-- TODO - error on MoleculeActionSelect: steps to reproduce: type substring of an existing item and pick that item - change the input - tab out -> the blur event is not triggered!!! The box with suggestions stays there -->
    <!-- TODO - adjust regex on all amount fields to allow numbers without decimals (i.e. just 100) -->
    <!-- TODO - default value for bankAccount description (in API) -->
    <!-- TODO - on OrganismAccountHolder: center the accountData vertically (on the account cards), there is too less space at the top -->




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
        <OrganismCollapsibleWithSlot :title="accountHolder.name">
          <MoleculeAccountViewTable :bankAccounts="accountHolder.bankAccounts" />
        </OrganismCollapsibleWithSlot>
        <AtomEditIcon :data-id="accountHolder.id" @click="editAccountHolder" />
      </div>

      <AtomButton type="light" text="Kontoinhaber hinzufügen" @click.prevent="$router.push('/new-account-holder')" />

    </section>
  </div>
</template>

<script>
import AtomButton from '@/components/atoms/AtomButton';
import AtomHeadline from '@/components/atoms/AtomHeadline';
import AtomEditIcon from '@/components/atoms/AtomEditIcon';
import AtomParagraph from '@/components/atoms/AtomParagraph';

import MoleculeAccountViewTable from '@/components/molecules/MoleculeAccountViewTable';
import MoleculeLoading from '@/components/molecules/MoleculeLoading';

import OrganismCollapsibleWithSlot from '@/components/organisms/OrganismCollapsibleWithSlot';

import { AccountHolderService } from "@/services/account-holder-service";
import { NumberService } from "@/services/number-service";

export default {
  async created() {
    try {
      this.accountHolders = await AccountHolderService.getAll(this.userId);
      this.dataLoaded = true;
    } catch (error) {
      this.loadingError = true;
      console.error(error);
    }
  },

  components: {
    AtomButton,
    AtomHeadline,
    AtomEditIcon,
    AtomParagraph,
    MoleculeLoading,
    OrganismCollapsibleWithSlot,
    MoleculeAccountViewTable,
  },

  data() {
    return {
      //TODO - implement proper login with authentication and pass the userId to the component(s), maybe fetch from loginCookie??
      userId: 1,
      dataLoaded: false,
      loadingError: false,

      accountHolders: null,
    };
  },

  methods: {
    editAccountHolder(event) {
      let element = event.target;

       while (!element.dataset.id) {
        element = element.parentNode;
      }

      const id = element.dataset.id;

       this.$router.push(`/edit-account-holder/${id}`);
    },

    formatCurrency(value) {
      return NumberService.formatCurrency(value);
    },
  },
};
</script>
