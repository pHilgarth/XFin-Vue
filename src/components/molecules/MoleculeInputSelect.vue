<template>
  <div class="molecule-input-select form-floating">
    <AtomInputSelect :id="field" :class="`${hasErrors ? ' has-errors' : ''}`" :value="modelValue" :options="options"
                     @input="$emit('update:modelValue', $event.target.value)" @blur="$emit('blur')" :disabled="disabled"/>
    <AtomLabel class="xfin__form__label" :for="field" :text="label" />
    <template v-for="(error, index) in validation?.$errors" :key="index">
      <MoleculeFormError :error="error" :errorMessageParams="errorMessageParams" />
    </template>
  </div>
</template>

<script>

import AtomInputSelect from "@/components/atoms/AtomInputSelect";
import AtomLabel from '@/components/atoms/AtomLabel';
import MoleculeFormError from '@/components/molecules/MoleculeFormError';


export default {
  emits: [
    'update:modelValue',
    'blur',
  ],

  props: {
    disabled:           { type: Boolean, default: false },
    errorMessageParams: { type: Object },
    hasErrors:          { type: Boolean },
    validation:         { type: Object },

    field: {
      type: String,
      required: true
    },
    label: {
      type: String,
      required: true
    },
    modelValue: {
      type: [String, Number],
      required: true
    },
    options: {
      type: [Array, Object],
      required: true,
    },
  },

  components: {
    AtomInputSelect,
    AtomLabel,
    MoleculeFormError,
  },
};
</script>