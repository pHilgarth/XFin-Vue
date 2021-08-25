
<template>
  <div class="account-view">
    <h1 class="account-view-headline">Kontenübersicht</h1>
    <section class="loading" v-if="loading">
      <div>Daten werden geladen ...</div>
    </section>
    <section class="loading-error" v-else-if="!accountHolders">
      <div class="fetching-error">Fehler beim Laden der Kontoinhaber!</div>
    </section>
    <section class="account-view-body" v-else>
      <card-component v-for="accountHolder in accountHolders" :key="accountHolder.id" :cardConfig="configureCard(accountHolder)">
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
            <tr v-for="bankAccount in accountHolder.bankAccounts" :key="bankAccount.id">
              <td>
                <router-link :to="'/accounts/' + bankAccount.id">{{
                  bankAccount.accountNumber
                }}</router-link>
              </td>
              <td>{{ bankAccount.description }}</td>
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
        <router-link :to="'/accountHolders/' + accountHolder.id" class="xfin-button">Kontoinhaber bearbeiten</router-link>
      </card-component>
      <div class="account-view-add-account-holder">
        <router-link to="/accountHolders/0" class="xfin-button">
          Kontoinhaber hinzufügen
        </router-link>
      </div>
    </section>
  </div>
</template>

<script>
import CardComponent from "../_shared/card-component/CardComponent";

import { AccountHolderService } from "../../services/account-holder-service";
import { NumberService } from "../../services/number-service";

export default {
  beforeMount() {
    this.getAccountHolders(true);
  },

  components: {
    CardComponent,
  },

  data() {
    return {
      accountHolders: [],
      loading: true,
    };
  },

  methods: {
    configureCard(accountHolder) {
      return {
        cardExpanded: false,
        cardHeadline: accountHolder.name,
        cardId: "accountHolder-" + accountHolder.id
      }
    },

    async getAccountHolders(includeAccounts = false) {
      this.accountHolders = await AccountHolderService.getAccountHolders(includeAccounts);

      this.accountHolders.forEach(accountHolder => {
        accountHolder.bankAccounts.forEach(bankAccount => {
          bankAccount.accountNumber = NumberService.getAccountNumber(bankAccount.iban);
        });
      });

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
