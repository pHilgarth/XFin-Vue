<template>
    <select @change="getAccountAction($event, config.bankAccountId)">
        <option>Aktion wählen ...</option>
        <option id="new-revenue">Einnahme eintragen</option>
        <option id="new-expense">Ausgabe eintragen</option>
        <option id="budget-manager">Budget verwalten</option>
        <option>Fixkostenverwaltung</option>
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