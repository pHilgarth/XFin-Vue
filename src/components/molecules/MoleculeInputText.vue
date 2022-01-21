<template>
<!-- TODO - rework all components using this Molecule to use the prop 'label' for the label text and a lowercase english word for the id and the labels for-attribute -->
    <div v-if="small" :class="classList" :id="id">
        <AtomLabel v-if="label" classList="xfin-form__label col-2" :target="field" :text="`${label}${optional ? '' : ' <i>*</i>'}`" />                   
        <AtomInputText  :id="field" :disabled="disabled" :value="modelValue" :classList="`xfin-form__control form-control form-control-sm${hasErrors ? ' has-errors' : ''}`"
                        @blur="$emit('blur')" @input="$emit('update:modelValue', $event.target.value)" />
        <template v-for="(error, index) in validation?.$errors" :key="index">
            <AtomParagraph class="xfin-form__error" :text="getErrorMessage(error.$property, error.$validator, errorMessageParams)" />
        </template>
    </div>
    <div v-else-if="label" class="form-floating" :class="classList" :id="id">
        <AtomInputText  :id="field" :disabled="disabled" :value="modelValue" :placeholder="label"
                        :classList="`xfin-form__control form-control col-4${hasErrors ? ' has-errors' : ''}`"
                        @blur="$emit('blur')" @input="$emit('update:modelValue', $event.target.value)" />
        <AtomLabel classList="xfin-form__label" :target="field" :text="`${label}${optional ? '' : ' <i>*</i>'}`" />
        <template v-for="(error, index) in validation?.$errors" :key="index">
            <AtomParagraph class="xfin-form__error" :text="getErrorMessage(error.$property, error.$validator, errorMessageParams)" />
        </template>
    </div>
        <div v-else :class="classList" :id="id">
        <AtomInputText  :id="field" :disabled="disabled" :value="modelValue" :placeholder="label"
                        :classList="`xfin-form__control form-control col-4${hasErrors ? ' has-errors' : ''}`"
                        @blur="$emit('blur')" @input="$emit('update:modelValue', $event.target.value)" />
        <template v-for="(error, index) in validation?.$errors" :key="index">
            <AtomParagraph class="xfin-form__error" :text="getErrorMessage(error.$property, error.$validator, errorMessageParams)" />
        </template>
    </div>
</template>

<script>
import AtomInputText from "@/components/atoms/AtomInputText";
import AtomLabel from "@/components/atoms/AtomLabel";
import AtomParagraph from "@/components/atoms/AtomParagraph";

import { errorMessages } from "@/services/form-error-messages";
export default {
    emits: [
        'blur',
        'update:modelValue'
        ],
    props: {
        id:             { type: String },
        classList:      { type: String },
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