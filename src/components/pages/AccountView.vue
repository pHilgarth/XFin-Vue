<template>
  <div class="account-view">
    <AtomHeadline tag="h1" text="Kontenübersicht" />

    <h6>
      <ul>
        <li>Problem beim Monatsübergang (recurringTransactions)</li>
        <li>AccountView Component muss aktualisiert werden, wenn die recurringTransactions sich aktualisieren</li>
        <li>Das Bestätigen / Verwerfen von Transactions soll animiert werden</li>
      </ul>
    </h6>

    <div style="display:none" class="todo-items">
      <!-- TODO - general todos -->
      <!-- TODO - unbedingt genau prüfen, ob die Summen im Budget-Manager mit dem Kontostand in der AccountView und den Daten in der AccountDetail übereinstimmen, habe da bei 27911004 eine Diskrepanz entdeckt, die aber auch durch die Testdaten verursacht worden sein könnte -->
      <!-- TODO - UPDATE zu TODO eine Zeile drüber: da fehlten noch die Rücklagen im Budget-Manager, daher evtl. die Diskrepanz !!! -->
      <!-- TODO - überall, wo Namen vergeben werden können, prüfen, ob der Name in der DB für die Entity bereits existiert! (Kontoinhaber, Rücklagen, Darlehen, etc....) -->
      <!-- TODO - hier auf AccountView jeden Tag die wiederkehrenden Einnahmen kontrollieren - wenn für den Tag eine vorhanden ist, muss diese dann noch bestätigt werden- der Betrag und die Referenz nochmal geändert werden, bevor sie verbucht wird-->
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
      <!-- TODO - remember to pass the proper transactionType int value, when posting new transactions of type != neutral (its an enum in api) -->
      <!-- TODO - select fields in forms should not have a preselected value, users should be forced to select a value (for now at least in transaction form -->
      <!-- TODO - use MoleculeNotice for notifications / errros etc.. -> auch für Meldungen wie "Keine .... für dieses Konto gefunden" oder ähnliche Meldungen -->
      <!-- TODO - set "required" prop on input fields, where it is needed, to render a little asterisk -->
      <!-- TODO - replace old OrganismCollapsible with OrganismCollapsibleWithSlot and rename the new afterwards to just OrganismCollapsible -->
      <!-- TODO - implement transaction detail view as model in accountDetail -->
      <!-- TODO - cancel button on NewReserve.vue -->
      <!-- TODO - update BudgetManager -> budgetManager is used to organize the money on a single costCenter on the same account, i.e. 20 € for XY, 30 € for AB, .... -->
      <!-- TODO - refactor styles for "modal" components (i.e. OrganismExternalPartyModal, OrganismCostCenterForm, ....) -> they're duplicated right now in the css-files for the individual components -->
      <!-- TODO - rename class "......duplicate-account" on the different Organism......Forms to the correct thing (i.e. OrganismCostCenterAssetForm -> it should be duplicated-name or -cost-center-asset... something like that-->
      <!-- TODO - Betrag Verfügbarkeit auf CostCenters, Rücklagen und CostCenterAssets berücksichtigen!! -->
      <!-- TODO  - Rücklagen und CostCenterAssets können nicht überzogen werden - CostCenters selber schon (wenn kein Asset / keine Rücklage beim Zahlungspflichtigen ausgewählt wird)-->
      <!-- TODO - rework Login / Authentication -->
      <!-- TODO - beim Anlegen eines Darlehens wird die Einnahme direkt verbucht, also die Auszahlung des Darlehensbetrags! Im Transaktionsmanager kann dann keine Einnahme mehr für das Darlehen verbucht werden, d.h. es darf auch nicht ausgewählt werden können, wenn die Accounts entsprechend ausgewählt wurden! -->
      <!-- TODO - Rücklage anlegen: hier wird im Menü "Dashboard" blau angezeigt, anstatt "Rücklagen" -->
      <!-- TODO - Beschränkungen für TextInputs für jedes Feld in jeder Form festlegen, z.B. Name max. 25 zeichen oder so -->
      <!-- TODO - MoleculeInputText in der Länge beschränken! Je nachdem, wie lang der Input sein darf, dürfen nicht mehr Zeichen eingetragen werden können! Das erste Zeichen, das zuviel ist, muss also immer sofort wieder gelöscht werden! -->
      <!-- TODO - AccountNumber nur anzeigen bei internen Konten und nur, wenn der AccountHolder mehr als einen Account hat!!! -->
      <!-- TODO - Löschen von jeglichen Daten fehlt noch komplett -->
      <!-- TODO - im Budgetmanager gibt es keine Error-Messages / Validation-Messages -->
      <!-- TODO - im Budgetmanager verschiebt sich das Layout, wenn ein Posten bearbeitet wird -->
      <!-- TODO - jedes Modal: max-height 800px oder so (nochmal prüfen) und overflow-y: scroll -->
      <!-- TODO - AccountDetail: ungültige id direkt in die URL eingeben und abschicken -> kein Error, nur dauerhaft "Daten werden geladen" -->
      <!-- TODO - use just "account" everywhere instead of "bankAccount" -> don't forget backend!!! -->
      <!-- TODO - add cash system (bargeld!) on creation of a new account the cash should be provided separately  -->
      <!-- TODO - costCenters orderby Name, alphabetically, and costCenterAssets -->
      <!-- TODO - Dashboard: wenn keine Kontoinhaber verfügbar sind, entsprechende Meldung anzeigen -->
      <!-- TODO - Dashboard: Überschrift "Heute fällige Transaktionen": irgendwie anders lösen, dass nicht nur die Überschrift dransteht, wenn keine fälligen Transaktionen verfügbar sind, vielleicht eine entsprechende Meldung ausgeben oder Überschrift ganz weglassen -->
      <!-- TODO - Kontoinhaber erstellen / bearbeiten: negative Beträge rot anzeigen bei den Konten -->
      <!-- TODO - Kontenübersicht: negative Beträge rot anzeigen -->
      <!-- TODO - eventuell den ActionSelect in der Kontenübersicht rausnehmen -->
      <!-- TODO - Kontodetailansicht: negative Beträge rot anzeigen -->
      <!-- TODO - wenn keine Einnahmen / Ausgaben vorhanden sind, entsprechende Meldung anzeigen -->
      <!-- TODO - Kontodetailansicht: Budget: Row für Nicht zugewiesenes Budget einfügen -->
      <!-- TODO - Transaktion - Externen Zahlungspartner neu anlegen: IBAN + BIC optional - keine Pflichtfelder -->
      <!-- TODO - externalParty erstellen: Name muss geprüft werden, darf nicht doppelt sein -->
      <!-- TODO - add notices for failure or success in transaction manager (transaction successful, transaction failed, ...) -->



      <!--      <p>Error Handling fehlt noch weitestgehend, einfach überall nochmal drüber gucken, wo man noch optimieren muss ( vor allem bei den api calls )</p>-->
      <!--      <p>Atom Props testen (id, class, additionalProps, etc. ... )</p>-->
      <!--      <p>scss und classes prüfen, welche brauche ich, bzw. kann ich die gesetzen classes vereinfachen, etc....</p>-->
      <!--      <p>implement smart scss z-indices</p>-->
    </div>

    <MoleculeLoading v-if="!dataLoaded" :loadingError="loadingError" errorMessage="Fehler beim Laden der Kontoinhaber!"/>

    <section v-else>
      <AtomParagraph class="pb-4" v-if="dataLoaded && accountHolders.length === 0" text="Keine Kontoinhaber gefunden!" />

      <div class="account-view__account-holder" v-for="accountHolder in accountHolders" :key="accountHolder.id">
        <OrganismCollapsibleWithSlot :title="accountHolder.name">
          <MoleculeAccountViewTable :bankAccounts="accountHolder.bankAccounts" />
        </OrganismCollapsibleWithSlot>
        <AtomEditIcon :showOnHover="true" @click="$router.push({ name: 'edit-account-holder', params: { accountHolderId: accountHolder.id }})" />
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

import { accountHolderService } from "@/services/account-holder-service";
import { numberService } from "@/services/number-service";

export default {

  async created() {
    try {
      if (this.$cookies.get('user')) {
        this.user = this.$cookies.get('user');
      }

      this.accountHolders = await accountHolderService.getAllByUser(this.user.id);
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
      accountHolders: null,
      dataLoaded: false,
      loadingError: false,
      user: null,
    };
  },

  methods: {
    formatCurrency(value) {
      return numberService.formatCurrency(value);
    },
  },
};
</script>
