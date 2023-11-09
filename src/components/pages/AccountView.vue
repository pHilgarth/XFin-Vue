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

    <div style="display:none" class="refactoring-todos">
      <!-- TODO - check every API call in this app for proper error handling -->
      <!-- TODO - make use of automatic attribute fallthrough (i.e. dont use classList on Atoms where only one root element is)-->
      <!-- TODO - arrange components in folders: organisms should live in folders named after their parent-components - when they're used multiple times across different components, they live in the folder "shared" - same goes for molecules and atoms -->
      <!-- TODO - rework props declaration on every component like its recommended in the vue styleguide -->
      <!-- TODO - merge pages NewAccountHolder and UpdateAccountHolder into one component rendering OrganismAccountHolder accordingly (maybe... maybe not, need to think about that-->
      <!-- TODO - rework form classes -> every form should have "xfin__form" and the form-elements "xfin__form__<control|error|label|etc....>" -->
      <!-- TODO - check if there are any classes set, which are not used by CSS and which are NO root-classes used for clarification (component root-classes) -->
      <!-- TODO - refactor styles for "modal" components (i.e. OrganismExternalPartyModal, OrganismCostCenterForm, ....) -> they're duplicated right now in the css-files for the individual components -->
    </div>

    <div style="display:none" class="todo-items">
      <!-- TODO - general todos -->
      <!-- TODO - unbedingt genau prüfen, ob die Summen im Budget-Manager mit dem Kontostand in der AccountView und den Daten in der AccountDetail übereinstimmen, habe da bei 27911004 eine Diskrepanz entdeckt, die aber auch durch die Testdaten verursacht worden sein könnte -->
      <!-- TODO - UPDATE zu TODO eine Zeile drüber: da fehlten noch die Rücklagen im Budget-Manager, daher evtl. die Diskrepanz !!! -->
      <!-- TODO - überall, wo Namen vergeben werden können, prüfen, ob der Name in der DB für die Entity bereits existiert! (Kontoinhaber, Rücklagen, Darlehen, etc....) -->
      <!-- TODO - hier auf AccountView jeden Tag die wiederkehrenden Einnahmen kontrollieren - wenn für den Tag eine vorhanden ist, muss diese dann noch bestätigt werden- der Betrag und die Referenz nochmal geändert werden, bevor sie verbucht wird-->
      <!-- TODO - enable save button OrganismAccountForm only if changes were made -->
      <!-- TODO - enable save button OrganismAccountHolder only if changes were made -->
      <!-- TODO - update api call on UpdateAccountHolder to be equal as the others -->
      <!-- TODO - disable budget manager and other components, when no accountHolders are available -->
      <!-- TODO - move the edit account holder link out of the collapsible title into a section "settings" or else (in main menu sidebar) -->
      <!-- TODO - write a service that removes <script>-tags from text that is used in v-html somewhere -->
      <!-- TODO - add "this.iban = this.iban.toUpperCase();" to every iban and bic field watcher in other components and remove 'toUpperCase' afterwards where it's no longer needed -->
      <!-- TODO - if no changes are made to account, disable save-button (on OrganismAccountForm) -->
      <!-- TODO - OrganismTransaction: MoleculeInputAutoSuggest wont close -> reproduce: type something in - click 'add new' - type more in - blur it using tab -->
      <!-- TODO - do I need the components in main.js globally? (OrganismBudgetList, OrganismTable, MoleculeActionSelect) -->
      <!-- TODO - maybe include a way to update externalBankAccount data? -->
      <!-- TODO - error on MoleculeActionSelect: steps to reproduce: type substring of an existing item and pick that item - change the input - tab out -> the blur event is not triggered!!! The box with suggestions stays there -->
      <!-- TODO - adjust regex on all amount fields to allow numbers without decimals (i.e. just 100) -->
      <!-- TODO - default value for bankAccount description (in API) -->
      <!-- TODO - remember to pass the proper transactionType int value, when posting new transactions of type != neutral (its an enum in api) -->
      <!-- TODO - select fields in forms should not have a preselected value, users should be forced to select a value (for now at least in transaction form -->
      <!-- TODO - set "required" prop on input fields, where it is needed, to render a little asterisk -->
      <!-- TODO - replace old OrganismCollapsible with OrganismCollapsibleWithSlot and rename the new afterwards to just OrganismCollapsible -->
      <!-- TODO - implement transaction detail view as model in accountDetail -->
      <!-- TODO - cancel button on NewReserve.vue -->
      <!-- TODO - rename class "......duplicate-account" on the different Organism......Forms to the correct thing (i.e. OrganismCostCenterAssetForm -> it should be duplicated-name or -cost-center-asset... something like that-->
      <!-- TODO - rework Login / Authentication -->
      <!-- TODO - beim Anlegen eines Darlehens wird die Einnahme direkt verbucht, also die Auszahlung des Darlehensbetrags! Im Transaktionsmanager kann dann keine Einnahme mehr für das Darlehen verbucht werden, d.h. es darf auch nicht ausgewählt werden können, wenn die Accounts entsprechend ausgewählt wurden! -->
      <!-- TODO - Rücklage anlegen: hier wird im Menü "Dashboard" blau angezeigt, anstatt "Rücklagen" -->
      <!-- TODO - Beschränkungen für TextInputs für jedes Feld in jeder Form festlegen, z.B. Name max. 25 zeichen oder so -->
      <!-- TODO - MoleculeInputText in der Länge beschränken! Je nachdem, wie lang der Input sein darf, dürfen nicht mehr Zeichen eingetragen werden können! Das erste Zeichen, das zuviel ist, muss also immer sofort wieder gelöscht werden! -->
      <!-- TODO - Löschen von jeglichen Daten fehlt noch komplett -->
      <!-- TODO - jedes Modal: max-height 800px oder so (nochmal prüfen) und overflow-y: scroll -->
      <!-- TODO - AccountDetail: ungültige id direkt in die URL eingeben und abschicken -> kein Error, nur dauerhaft "Daten werden geladen" -->
      <!-- TODO - use just "account" everywhere instead of "bankAccount" -> don't forget backend!!! -->
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
      <!-- TODO -  AccountDetail: wenn keine KS ausgewählt wurde bei eienr Transaktion, anstatt "Nicht zugewiesen" einfach "---" ausgeben (oder "n/a" oder ähnliches) -->
      <!-- TODO - I have OrganismRecurringTransactionModal as well as MoleculeRecurringTransactionModal ... there should only be one -->
      <!-- TODO - its not possible to rename CostCenters or CostCenterAssets in BudgetManager -->
      <!-- TODO - current parent menu point is not highlighted in menu when routing to a subcomponent, like AccountHolders -> AddAccountHolder -->
      <!-- TODO - constraints on entity-properties in API must be adhered to in frontend -->
      <!-- TODO - if backend is not available there is an unstyled ugly error in frontend, when trying to save an account on edit account holder -->
      <!-- TODO - if an existing account is edited without actually changing fields, it's still labelled as "changed" -->
      <!-- TODO - highlight the changed fields of bankAccounts in the cards on edit-account-holder -->
      <!-- TODO - dont reset transactionType after saving a transaction (after saving an expense, expense should be still selected) -->
      <!-- TODO - cash can never be negative - I need a validation for that in TransactionManager -->
      <!-- TODO - include the accountNumber in the Revenues- and ExpensesTable for transfers, so that there is not just the accountHolderName but also which account the money went / came from -->
      <!-- TODO - wenn url /account-holders direkt aufgerufen wird, gibt es keien Daten, aber auch keinen Fehler edit-account-holders muss mit id des account-holders aufgerufen werden -->
      <!-- TODO - current menu item -> when routing to a subcomponent, the first menu item is highlighted instead of the actual parent item (accountView > accountDetail: dashboard is highlighted instead of accountView, which is the parent) -->



      <!--      <p>Error Handling fehlt noch weitestgehend, einfach überall nochmal drüber gucken, wo man noch optimieren muss ( vor allem bei den api calls )</p>-->
      <!--      <p>Atom Props testen (id, class, additionalProps, etc. ... )</p>-->
      <!--      <p>scss und classes prüfen, welche brauche ich, bzw. kann ich die gesetzen classes vereinfachen, etc....</p>-->
      <!--      <p>implement smart scss z-indices</p>-->
    </div>

    <MoleculeLoading v-if="!dataLoaded" :loadingError="loadingError" errorMessage="Fehler beim Laden der Kontoinhaber!"/>

    <section v-else>
      <AtomParagraph class="pb-4" v-if="dataLoaded && accountHolders.length === 0" text="Keine Kontoinhaber gefunden!" />

      <div class="account-view__account-holder" v-for="accountHolder in accountHolders" :key="accountHolder.id">
        <OrganismCollapsibleWithSlot :title="accountHolder.name" :accordionId="accountHolder.id">
          <MoleculeAccountViewTable :bankAccounts="accountHolder.bankAccounts" />
        </OrganismCollapsibleWithSlot>
      </div>
    </section>
  </div>
</template>

<script>
import AtomHeadline from '@/components/atoms/AtomHeadline';
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
    AtomHeadline,
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
