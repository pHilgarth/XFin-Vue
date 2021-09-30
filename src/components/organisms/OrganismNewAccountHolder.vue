<template>
  <OrganismModal>
    <AtomHeadline tag="h1" text="Kontoinhaber hinzufügen" />
    <MoleculeInputText field="Name" :hasErrors="hasErrors('name')" :disabled="disabled" v-model="name" @blur="v$.name.$touch()" :validation="v$.name" />
    <!-- TODO - maybe remove hr and do it with css -->
    <hr />
    <div :class="`add-account__buttons ${formActiveClass}`">
      <button @click="formActive = true">{{ addAccountLabel }}</button>
      <button @click="formActive = false">Abbrechen</button>
    </div>
    <div :class="`add-account__form ${formActiveClass}`">
      <MoleculeInputText field="IBAN" :hasErrors="hasErrors('iban')" :disabled="disabled" v-model="iban" @blur="v$.iban.$touch()" :validation="v$.iban" />
      <MoleculeInputText field="BIC" :hasErrors="hasErrors('bic')" :disabled="disabled" v-model="bic" @blur="v$.bic.$touch()" :validation="v$.bic" />
      <MoleculeInputText field="Bank" :disabled="disabled" v-model="bank" />
      <MoleculeInputText field="Beschreibung" :disabled="disabled" v-model="description" />
      <MoleculeInputText field="Kontostand" :hasErrors="hasErrors('balance')" :disabled="disabled" v-model="balance" @blur="v$.balance.$touch()" :validation="v$.balance" />
    </div>

    <button @click="$emit('close')">Close</button>
  </OrganismModal>
</template>

<script>
//TODO - Delete this component?
import AtomHeadline from "@/components/atoms/AtomHeadline";

import MoleculeInputText from "@/components/molecules/MoleculeInputText";

import OrganismModal from "@/components/organisms/OrganismModal";

import { useVuelidate } from "@vuelidate/core";

import { accountHolderValidation } from "@/validation/validations";


export default {
  components: {
    AtomHeadline,
    MoleculeInputText,
    OrganismModal,
  },

  setup() {
    return {
      v$: useVuelidate(),
    };
  },

  validations() { return accountHolderValidation; },

  data() {
    return {
      modalOpened: true,
      formActive: false,
    };
  },

  computed: {
    addAccountLabel() {
      return this.formActive ? 'Konto hinzufügen' : 'Neues Konto';
    },

    formActiveClass() {
      return this.formActive ? 'form-active' : '';
    },
  },

  methods: {
    hasErrors(property) {
      //property has to match a validator in this components validations function
      return this.v$[property].$error ? 'has-errors' : '';
    },
  }
};
</script>
