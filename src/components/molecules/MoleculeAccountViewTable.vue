<template>
  <table class="molecule-account-view-table">
    <thead>
      <tr>
        <th>Konto</th>
        <th>Kontotyp</th>
        <th>Kontostand</th>
        <th>Bargeld</th>
        <th>Gesamt</th>
        <th>Aktion</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="bankAccount in bankAccounts" :key="bankAccount.id">
        <td>
          <router-link :to="`/accounts/${bankAccount.id}`">{{bankAccount.accountNumber}}</router-link>
        </td>
        <td>{{ bankAccount.description }}</td>
        <td>{{ formatCurrency(bankAccount.balance) }}</td>
        <td>{{ formatCurrency(bankAccount.cash) }}</td>
        <td>{{ formatCurrency(bankAccount.balance + bankAccount.cash) }}</td>
        <td>
          <MoleculeActionSelect :bankAccount="bankAccount" />
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script>
import MoleculeActionSelect from '@/components/molecules/MoleculeActionSelect';

import { numberService } from "@/services/number-service";

export default {
  components: {
    MoleculeActionSelect,
  },

  props: {
    bankAccounts: { type: Array, required: true },
  },

  methods: {
    formatCurrency(value) {
      return numberService.formatCurrency(value);
    }
  }
}
</script>

<!--<template>-->
<!--  <table>-->
<!--    <thead>-->
<!--    <tr>-->
<!--      <th>Konto</th>-->

<!--    </tr>-->
<!--    </thead>-->
<!--    <tbody>-->
<!--    <template v-for="bankAccount in bankAccounts" :key="bankAccount.id">-->
<!--      <tr>-->
<!--        <td>-->
<!--          <router-link :to="`/accounts/${bankAccount.id}`">-->
<!--            {{bankAccount.accountNumber}}-->
<!--          </router-link>-->
<!--        </td>-->
<!--        <td>{{bankAccount.description}}</td>-->
<!--        <td>{{bankAccount.balance}}</td>-->
<!--        <td>-->
<!--          <MoleculeActionSelect :bankAccount="bankAccount" />-->
<!--        </td>-->
<!--      </tr>-->
<!--    </template>-->
<!--    </tbody>-->
<!--  </table>-->
<!--</template>-->