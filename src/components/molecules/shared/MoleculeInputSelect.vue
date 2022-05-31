<template>
  <div class="molecule-input-select form-floating">
    <AtomInputSelect :id="field" :value="modelValue" :options="options"
                     @input="$emit('update:modelValue', $event.target.value)" @blur="$emit('blur')"/>
    <AtomLabel class="xfin__form__label" :for="field" :text="label"/>
  </div>
</template>

<script>
import {errorMessages} from "@/services/form-error-messages";

import AtomInputSelect from "@/components/atoms/AtomInputSelect";
import AtomLabel from "@/components/atoms/shared/AtomLabel";

export default {
  emits: [
    'update:modelValue',
    'blur',
  ],

  props: {
    field: {type: String},
    options: {
      type: Array,
      required: true,
    },
    modelValue: {type: [String, Number], required: true},
    label: {type: String, required: true},
    hasErrors: { type: Boolean },
    validation:     { type: Object },
  },

  components: {
    AtomInputSelect,
    AtomLabel,
  },

  data() {
    return {counter: 0}
  },

  methods: {
    getErrorMessage(property, validator) {
      return errorMessages[`${property}_${validator}`] ||
          errorMessages[property]
    },

    //TODO - remove if really not needed
    // optionChanged(event) {
    //     this.$emit('option-changed', event);
    // }
  }
};
</script>