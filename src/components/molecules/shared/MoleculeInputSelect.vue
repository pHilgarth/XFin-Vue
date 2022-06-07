<template>
  <div class="molecule-input-select form-floating">
    <AtomInputSelect :id="field" :value="modelValue" :options="options"
                     @input="$emit('update:modelValue', $event.target.value)" @blur="$emit('blur')"/>
    <AtomLabel class="xfin__form__label" :for="field" :text="label" />
  </div>
</template>

<script>

import AtomInputSelect from "@/components/atoms/AtomInputSelect";
import AtomLabel from "@/components/atoms/shared/AtomLabel";

export default {
  emits: [
    'update:modelValue',
    'blur',
  ],

  props: {
    field:      { type: String },
    hasErrors:  { type: Boolean },
    validation: { type: Object },

    options: {
      type: Array,
      required: true,
    },
    modelValue: {
      type: [String, Number],
      required: true
    },
    label: {
      type: String,
      required: true
    },
  },

  components: {
    AtomInputSelect,
    AtomLabel,
  },
};
</script>