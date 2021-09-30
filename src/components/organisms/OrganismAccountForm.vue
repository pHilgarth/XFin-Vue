<template>
    <div class="account-form" :class="active ? 'active' : ''">
        <h1>
            fuck you
        </h1>
    </div>
    <!-- <form class="xfin-form">
        <MoleculeInputText field="IBAN" :hasErrors="hasErrors('iban')" :disabled="disabled" v-model="iban" @blur="v$.iban.$touch()" :validation="v$.iban" />
        <MoleculeInputText field="BIC" :hasErrors="hasErrors('bic')" :disabled="disabled" v-model="bic" @blur="v$.bic.$touch()" :validation="v$.bic" />
        <MoleculeInputText field="Bank" :disabled="disabled" v-model="bank" />
        <MoleculeInputText field="Beschreibung" :disabled="disabled" v-model="description" />
        <MoleculeInputText field="Kontostand" :hasErrors="hasErrors('balance')" :disabled="disabled" v-model="balance" @blur="v$.balance.$touch()" :validation="v$.balance" />

        <AtomButton v-if="selectedAccountIndex == -1" classList="xfin-form__button btn btn-primary btn-submit-account" text="Konto speichern" @click.prevent="addAccount" />
        <AtomButton v-else classList="xfin-form__button btn btn-primary btn-edit-account" :text="!pendingAccountEdit ? 'Konto bearbeiten' : 'Abbrechen'"
            @click.prevent="toggleAccountEdit" />            
        <AtomButton v-if="selectedAccountIndex != -1 && pendingAccountEdit" classList="xfin-form__button btn btn-primary btn-update-account"
            text="Änderungen speichern" @click.prevent="updateAccount" />            
        <AtomButton v-if="selectedAccountIndex != -1 && !pendingAccountEdit" classList="xfin-form__button btn btn-primary btn-delete-account"
            text="[Trash]" @click="deleteAccount" :additionalProps="{ title: 'Konto entfernen' }" />

        <AtomButton classList="xfin-form__button btn btn-primary btn-submit-form" text="Kontoinhaber speichern" @click.prevent="saveAccountHolder"
            :additionalProps="{ disabled: pendingAccountCreation || pendingAccountEdit }" />
    </form> -->
</template>

<script>
export default {
    mounted() {
        this.active = true;
    },

    data() {
        return {
            active: false,
        };
    },
}
</script>