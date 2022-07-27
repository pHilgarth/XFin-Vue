<template>
  <select class="molecule-action-select" @change="getAccountAction($event, bankAccount.id)">
    <option>Aktion wählen ...</option>
    <option id="new-revenue">Einnahme eintragen</option>
    <option id="new-expense">Ausgabe eintragen</option>
    <option id="budget-manager">Budget verwalten</option>
    <option>Fixkostenverwaltung</option>
  </select>
</template>

<script>

export default {
    props: {
      bankAccount: { type: Object, required: true },
    },

    methods: {
        getAccountAction(event, id) {
        let optionId = event.target.selectedOptions[0].id;
        this.$router.push('/' + optionId + '/' + id);
        },
    },
}
</script>