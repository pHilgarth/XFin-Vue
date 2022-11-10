<template>
  <div class="organism-cost-center-asset-form">
    <div class="organism-cost-center-asset-form__inner">
      <AtomHeadline tag="h1" text="Posten auf Kostenstelle anlegen" />
      <AtomHeadline tag="h5" :text="`Kostenstelle: ${costCenterName}`" />
      <form>
        <MoleculeInputText class="pb-5" field="name" :hasErrors="v$.name.$error || nameDuplicate" v-model="name" @blur="v$.name.$touch()" :validation="v$.name" label="Name" />
        <AtomParagraph v-if="nameDuplicate" class="organism-cost-center-asset-form__duplicate-account xfin__form__error" text="Dieser Name existiert bereits!" />

        <AtomButton text="Speichern" :disabled="v$.$silentErrors.length > 0 || nameDuplicate" type="primary" @click.prevent="$emit('save', name)" />
        <AtomButton text="Abbrechen" type="cancel" @click.prevent="$emit('cancel')" />

      </form>
    </div>
  </div>
</template>

<script>

import { useVuelidate } from "@vuelidate/core";
import { required } from "@vuelidate/validators";

import AtomButton from '@/components/atoms/AtomButton';
import AtomHeadline from "@/components/atoms/AtomHeadline";
import AtomParagraph from '@/components/atoms/AtomParagraph';
import MoleculeInputText from "@/components/molecules/MoleculeInputText";

export default {
  components: {
    AtomButton,
    AtomHeadline,
    AtomParagraph,
    MoleculeInputText,
  },

  computed: {
    nameDuplicate() {
      return this.names.includes(this.name);
    },
  },

  data() {
    return {
      name: null,
    }
  },

  props: {
    costCenterName: { type: String, required: true },
    names: { type: Array, required: true },
  },

  setup() {
    return { v$: useVuelidate() };
  },

  validations() {
    return {
      name: { required },
    };
  },

  watch: {
    name() {
      this.v$.name.$touch();
    }
  },
}

</script>