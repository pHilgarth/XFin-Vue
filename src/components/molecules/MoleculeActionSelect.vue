<!-- TODO - can I make the options dynamically? They're hardcoded in here ...-->
<template>
    <select @change="getAccountAction($event, config.bankAccount.id)">
        <option>Aktion wählen ...</option>
        <option v-if="config.bankAccount.accountSettings.receivesRevenues" id="new-revenue">Einnahme eintragen</option>
        <option v-if="config.bankAccount.accountSettings.effectsExpenses" id="new-expense">Ausgabe eintragen</option>
        <option id="budget-manager">Budget verwalten</option>
        <option>Fixkostenverwaltung</option>
        <option id="account-settings">Einstellungen</option>
    </select>
</template>

<script>
export default {
    methods: {
        getAccountAction(event, id) {
        let optionId = event.target.selectedOptions[0].id;
        this.$router.push('/' + optionId + '/' + id);
        },
    },

    props: {
        config: {
            type: Object,
            required: true,
        },

    }
}
</script>