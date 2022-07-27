<template>
  <div class="new-reserve">
    <AtomHeadline tag="h1" text="Rücklage anlegen" />
    <form>
      <MoleculeInputSelect class="new-reserve__account pb-5" :options="bankAccountOptions" field="account"
                           v-model="selectedAccountId" label="Konto"/>

      <MoleculeInputText class="pb-5" field="title" :hasErrors="titleErrors || duplicate" v-model="title" @blur="v$.title.$touch()" :validation="v$.title" label="Titel" />
      <AtomParagraph v-if="duplicate" class="new-reserve__duplicate-title xfin__form__error" text="Dieser Titel existiert bereits!" />

      <MoleculeInputText class="pb-5" field="targetAmount" :hasErrors="targetAmountErrors" v-model="targetAmount" :validation="v$.targetAmount"
                         label="Zielbetrag" @blur="v$.targetAmount.$touch()" />

      <MoleculeInputDate label="Zieldatum" v-model="targetDate" />

<!--      <AtomButton text="Konto speichern" :disabled="v$.$silentErrors.length > 0 || duplicate" type="primary" @click.prevent="save" />-->
<!--      <AtomButton text="Abbrechen" type="cancel" @click.prevent="$emit('cancel')" />-->
    </form>
  </div>
</template>

<script>
import { useVuelidate } from "@vuelidate/core";


import AtomHeadline from '@/components/atoms/AtomHeadline';
import AtomParagraph from '@/components/atoms/AtomParagraph';

import MoleculeInputDate from '@/components/molecules/MoleculeInputDate';
import MoleculeInputSelect from '@/components/molecules/MoleculeInputSelect';
import MoleculeInputText from '@/components/molecules/MoleculeInputText';

export default {
  components: {
    AtomHeadline,
    AtomParagraph,
    MoleculeInputDate,
    MoleculeInputSelect,
    MoleculeInputText,
  },

  data() {
    return {
      title: '',
      targetAmount: 0,
      targetDate: this.getDefaultTargetDate(), //TODO - what type should that be?
    }
  },

  methods: {
    getDefaultTargetDate() {
      const today = new Date();
      const month = today.getUTCMonth() < 10 ? `0${today.getUTCMonth()}` : today.getUTCMonth();
      const day = today.getUTCDate() < 10 ? `0${today.getUTCDate()}` : today.getUTCDate();

      return `${today.getUTCFullYear()}-${month}-${day}`;
    },
  },

  setup() {
    return {
      v$: useVuelidate(),
    };
  },

  validations() {
    return {

    }
  }
};

</script>