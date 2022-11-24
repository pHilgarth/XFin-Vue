<template>
  <!-- TODO - maybe remove hardcoded actions and move them into a service -->
  <select class="molecule-action-select" @change="getAccountAction($event, bankAccount.id)">
    <option>Aktion wählen ...</option>
    <option v-for="action in accountActions" :key="action.id" :id="action.id">{{action.label}}</option>

  </select>
</template>

<script>
import { bankAccountService } from '@/services/bank-account-service';

export default {
  props: {
    bankAccount: {type: Object, required: true},
  },

  data() {
    return {
      accountActions: bankAccountService.accountActions,
    };
  },

  methods: {
    getAccountAction(event, bankAccountId) {
      let optionId = event.target.selectedOptions[0].id;
      this.$router.push({name: optionId, params: {bankAccountId}});
    },
  },
}
</script>