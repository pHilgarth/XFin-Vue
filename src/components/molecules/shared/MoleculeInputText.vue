<template>
  <!-- TODO - rework all components using this Molecule to use the prop 'label' for the label text and a lowercase english word for the id and the labels for-attribute -->
  <!-- TODO - split this component up into multiple ones, it's too cumbersome atm -->
  <!-- TODO rework error message output -> if there is no error message to output, the height of the paragraph should remain 0 -> right now there is padding, even whithout a message, that leads to a layout shift-->

  <div class="form-floating molecule-input-text">
    <AtomInputText  :id="field" :disabled="disabled" :value="modelValue" :placeholder="label"
                    :classList="`xfin__form__form-control form-control col-4${hasErrors ? ' has-errors' : ''}`"
                    @blur="$emit('blur')" @input="$emit('update:modelValue', $event.target.value)" />
    <AtomLabel class="xfin__form__label" :for="field" :text="`${label}${optional ? '' : ' <i>*</i>'}`" />
    <template v-for="(error, index) in validation?.$errors" :key="index">
      <!-- TODO - build another component "MoleculeFormError" to get rid of this duplicated "getErrorMessage(error.$property, error.$validator, errorMessageParams)" -->
      <!-- TODO - in a separate component, I can fetch the error message once and then just ask if it's there, instead of calling "getErrorMessage" twice!! -->
      <!-- TODO - when splitting this whole component up into multiple ones - don't forget to implement the newly built "MoleculeFormError" in the other components as well -->
      <AtomParagraph v-if="getErrorMessage(error.$property, error.$validator, errorMessageParams)" class="xfin__form__error" :text="getErrorMessage(error.$property, error.$validator, errorMessageParams)" />
    </template>
  </div>
</template>

<script>
import AtomInputText from "@/components/atoms/shared/AtomInputText";
import AtomLabel from "@/components/atoms/shared/AtomLabel";
import AtomParagraph from "@/components/atoms/shared/AtomParagraph";

import { errorMessages } from "@/services/form-error-messages";
export default {
  emits: [
    'blur',
    'update:modelValue'
  ],
  props: {
    field:          { type: String, required: true, },
    label:          { type: String },
    hasErrors:      { type: Boolean },
    modelValue:     { type: String },
    disabled:       { type: Boolean },
    optional:       { type: Boolean },
    // validation has to be the vuelidate object of the property (i.e. v$.name)
    validation:     { type: Object },
    small:          { type: Boolean },
    errorMessageParams: { type: Object },
  },

  components: {
    AtomInputText,
    AtomLabel,
    AtomParagraph,
  },

  methods: {
    //params has to be an object with at least one property - the errorMessages can have placeholders (wrapped in {}), whose names map to the property-keys
    //this function gets a specific error message and replaces all placeholders with the values of the matching properties
    //that's how I output dynamic error messages
    //TODO - make this function reusable in a service
    getErrorMessage(property, validator, params) {
      let errorMessage = errorMessages[`${property}_${validator}`] || errorMessages[property];

      for (const key in params) {
        errorMessage = errorMessage.replace(`{${key}}`, params[key]);
      }

      //TODO - implement error handling: if the error message contains {...} substrings, but no params were passed to this function, return an empty errorMessage to prevent outputting weird strings

      return errorMessage;
      // return  errorMessages[`${property}_${validator}`] ||
      //         errorMessages[property]
    }
  }
};
</script>