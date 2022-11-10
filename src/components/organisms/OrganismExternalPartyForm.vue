<template>
  <div class="organism-external-party-form">
    <div class="organism-external-party-form__inner">
      <AtomHeadline tag="h1" text="Externen Zahlungspartner anlegen" />
      <form>
        <MoleculeInputText class="pb-5" field="name" :hasErrors="v$.name.$error || nameDuplicate" v-model="name" @blur="v$.name.$touch()" :validation="v$.name" label="Name" />
        <AtomParagraph v-if="nameDuplicate" class="organism-external-party-form__duplicate-account xfin__form__error" text="Dieser Name existiert bereits!" />

        <MoleculeInputText class="pb-5" field="iban" :hasErrors="v$.iban.$error || ibanDuplicate" v-model="iban" @blur="v$.iban.$touch()" :validation="v$.iban" label="IBAN" />
        <AtomParagraph v-if="ibanDuplicate" class="organism-external-party-form__duplicate-account xfin__form__error" text="Diese Iban existiert bereits!" />

        <MoleculeInputText class="pb-5" field="bic" :hasErrors="v$.bic.$error" v-model="bic" @blur="v$.bic.$touch()" :validation="v$.bic" label="BIC" />

        <AtomButton text="Speichern" :disabled="v$.$silentErrors.length > 0 || nameDuplicate || ibanDuplicate" type="primary" @click.prevent="save" />
        <AtomButton text="Abbrechen" type="cancel" @click.prevent="$emit('cancel')" />
        <AtomParagraph v-if="duplicateCheckError" text="Speichern nicht möglich!" class="mt-3 xfin__form__error"/>
      </form>
    </div>
  </div>
</template>

<script>
import { useVuelidate } from "@vuelidate/core";

import AtomButton from '@/components/atoms/AtomButton';
import AtomHeadline from "@/components/atoms/AtomHeadline";
import AtomParagraph from '@/components/atoms/AtomParagraph';
import MoleculeInputText from "@/components/molecules/MoleculeInputText";

import { externalPartyValidation } from "@/validation/validations";

export default {
  components: {
    AtomButton,
    AtomHeadline,
    AtomParagraph,
    MoleculeInputText,
  },

  props: {
    ibans: { type: Array, required: true },
    names: { type: Array, required: true },
  },

  data() {
    return {
      bic:                    null,
      iban:                   null,
      name:                   null,
    };
  },

  computed: {
    ibanDuplicate() {
      return this.ibans.includes(this.iban);
    },
    nameDuplicate() {
      return this.names.includes(this.name);
    },
  },

  watch: {
    bic() {
      this.bic = this.bic.toUpperCase();
      this.v$.bic.$touch();
      this.v$.bic.$touch();
    },
    iban() {
      this.iban = this.iban.toUpperCase();
      this.v$.iban.$touch();
    },
    name() {
      this.v$.name.$touch();
    }
  },

  setup() {
    return { v$: useVuelidate() };
  },

  validations() {
    return externalPartyValidation;
  },

  methods: {
    save() {
      const data = {
        name: this.name,
        bic: this.bic,
        iban: this.iban,
      };

      this.$emit("save", data);
    },
  },
};
</script>