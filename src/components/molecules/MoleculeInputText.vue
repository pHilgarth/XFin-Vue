<template>
  <div :class="`${ !small ? 'form-floating' : ''} molecule-input-text`">
    <AtomInputText  :id="field" :disabled="disabled" :value="modelValue" :placeholder="label" :tabindex="ignoreTab ? '-1' : ''"
                    :class="`xfin__form__form-control form-control col-4${hasErrors ? ' has-errors' : ''}`"
                    @blur="$emit('blur')" @input="$emit('update:modelValue', $event.target.value)" />
    <AtomLabel v-if="label" class="xfin__form__label" :for="field" :text="`${label}${optional ? '' : ' <i>*</i>'}`" />
    <template v-for="(error, index) in validation?.$errors" :key="index">
      <MoleculeFormError :error="error" :errorMessageParams="errorMessageParams" />
    </template>
  </div>
</template>

<script>
import AtomInputText from '@/components/atoms/AtomInputText';
import AtomLabel from '@/components/atoms/AtomLabel';

import MoleculeFormError from '@/components/molecules/MoleculeFormError';

import { errorService } from "@/services/form-error-service";

export default {
  emits: [
    'blur',
    'update:modelValue'
  ],

  props: {
    field:              { type: String, required: true, },
    label:              { type: String },
    hasErrors:          { type: Boolean },
    modelValue:         { type: String },
    disabled:           { type: Boolean },
    optional:           { type: Boolean, default: true },
    // validation has to be the vuelidate object of the property (i.e. v$.name)
    validation:         { type: Object },
    small:              { type: Boolean },
    errorMessageParams: { type: Object },
    ignoreTab:          { type: Boolean, default: false },
  },

  components: {
    AtomInputText,
    AtomLabel,
    MoleculeFormError,
  },

  data() {
    return {
      errorService: errorService,
    };
  },
};
</script>