
<template>
  <div class="account-view">
    <h1 class="account-view-headline">Kontenübersicht</h1>
    <section class="account-view-body">
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
//import { DepositorService } from "../../services/depositor-service.js";
import { NumberService } from "../../services/number-service.js";

export default {
  components: {
    CardComponent,
  },
  
  data() {
    return {
      depositors: this.getDepositors()//DepositorService.getDepositors(),
    };
  },

  methods: {
    getDepositors()
    {
      fetch('http://localhost:2905/api/depositors?includeAccounts=true').then((response) =>
      {
        if (response.ok)
        {
          return response.json();
        }
        else
        {
          return "NOTHING HERE";
        }
      }).then((data) =>
      {
        const depositors = [];

        for (const depositorId in data)
        {
          const bankAccounts = [];

          for (const bankAccountId in data[depositorId].bankAccounts) {
            bankAccounts.push(
            {
              id:               data[depositorId].bankAccounts[bankAccountId].id,
              depositorId:      data[depositorId].bankAccounts[bankAccountId].depositorId,
              balance:          data[depositorId].bankAccounts[bankAccountId].balance,
              accountNumber:    data[depositorId].bankAccounts[bankAccountId].accountNumber,
              iban:             data[depositorId].bankAccounts[bankAccountId].iban,
              bic:              data[depositorId].bankAccounts[bankAccountId].bic,
              bank:             data[depositorId].bankAccounts[bankAccountId].bank,
              accountType:      data[depositorId].bankAccounts[bankAccountId].accountType
            });
          }

          depositors.push(
          {
            id:             data[depositorId].id,
            name:           data[depositorId].name,
            bankAccounts:   bankAccounts
          });
        }
        
        console.log(this.depositors);
        this.depositors = depositors;
        console.log(this.depositors);
      });
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
