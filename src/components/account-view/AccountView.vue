
<template>
  <div class="account-view">
    <h1 class="account-view-headline">Kontenübersicht</h1>
    <section class="loading" v-if="loading">
      <div>Daten werden geladen ...</div>
    </section>
    <section class="loading-error" v-else-if="!depositors">
      <div class="fetching-error">Fehler beim Laden der Kontoinhaber!</div>
    </section>
    <section class="account-view-body" v-else>
      <card-component
        v-for="depositor in depositors"
        :key="depositor.id"
        cardName="depositor"
        :cardId="'depositor-' + depositor.id"
        :cardHeadline="depositor.name"
        :cardExpandedProp="false">
        <table>
          <thead>
            <tr>
              <th>Konto</th>
              <th>Kontotyp</th>
              <th>Kontostand</th>
              <th>Aktion</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="bankAccount in depositor.bankAccounts" :key="bankAccount.id">
              <td>
                <router-link :to="'/accounts/' + bankAccount.accountNumber">{{
                  bankAccount.accountNumber
                }}</router-link>
              </td>
              <td>{{ bankAccount.accountType }}</td>
              <td :class="{ negative: bankAccount.balance < 0 }">{{ formatCurrency(bankAccount.balance) }}</td>
              <td>
                <select @change="getAccountAction($event, account)">
                  <option>Aktion wählen ...</option>
                  <option id="new-revenue">Einnahme eintragen</option>
                  <option id="new-expense">Ausgabe eintragen</option>
                  <option id="budget-manager">Budget verwalten</option>
                  <option>Fixkostenverwaltung</option>
                  <option id="money-transfer">Geld umbuchen</option>
                </select>
              </td>
            </tr>
          </tbody>
        </table>
      </card-component>
      <div class="account-view-add-depositor">
        <router-link to="/edit-depositors/0" class="xfin-button">
          Kontoinhaber hinzufügen
        </router-link>
      </div>
    </section>
  </div>
</template>

<script>
/*-------------------------------------------------------------------------------------------

  >>> Import Components

-------------------------------------------------------------------------------------------*/
import CardComponent from "../_shared/card-component/CardComponent";


/*-------------------------------------------------------------------------------------------

  >>> Import Services

-------------------------------------------------------------------------------------------*/
//import getLeagueLeaders from "../../services/depositor-service.js";
import { DepositorService } from "../../services/depositor-service";
import { NumberService } from "../../services/number-service.js";

export default {
  components: {
    CardComponent,
  },

  data() {
    return {
      depositors: this.getDepositors(true),
      loading: true,
    };
  },

  methods: {
    async getDepositors(includeAccounts = false) {
      this.depositors = await DepositorService.getDepositors(includeAccounts);

      this.loading = false;
    },

    formatCurrency(value) {
      return NumberService.formatCurrency(value);
    },

    getAccountAction(event, account) {
      let optionId = event.target.selectedOptions[0].id;

      this.$router.push('/' + optionId + '/' + account.accountNumber);
    },
  },
};
</script>
