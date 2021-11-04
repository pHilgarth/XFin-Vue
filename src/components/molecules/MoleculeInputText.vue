<template>
<!-- TODO - rework all components using this Molecule to use the prop 'label' for the label text and a lowercase english word for the id and the labels for-attribute -->
    <div v-if="small" :class="classList" :id="id">
        <AtomLabel classList="xfin-form__label col-2" :target="field" :text="`${label}${optional ? '' : ' <i>*</i>'}`" />                   
        <AtomInputText  :id="field" :disabled="disabled" :value="modelValue" :classList="`xfin-from__control form-control form-control-sm ${hasErrors ? 'has-errors' : ''}`"
                        @blur="$emit('blur')" @input="$emit('update:modelValue', $event.target.value)" />

        <template v-for="(error, index) in validation?.$errors" :key="index">
            <AtomParagraph classList="xfin-form__error" :text="getErrorMessage(error.$property, error.$validator)" />
        </template>

    </div>
    <div v-else class="form-floating" :class="classList" :id="id">
        <AtomInputText  :id="field" :disabled="disabled" :value="modelValue" :placeholder="label"
                        :classList="`xfin-form__control form-control col-4 ${hasErrors ? 'has-errors' : ''}`"
                        @blur="$emit('blur')" @input="$emit('update:modelValue', $event.target.value)" />
                        
        <AtomLabel classList="xfin-form__label" :target="field" :text="`${label}${optional ? '' : ' <i>*</i>'}`" />

        <template v-for="(error, index) in validation?.$errors" :key="index">
            <AtomParagraph classList="xfin-form__error" :text="getErrorMessage(error.$property, error.$validator)" />
        </template>
    </div>
</template>

<script>
import AtomInputText from "@/components/atoms/AtomInputText";
import AtomLabel from "@/components/atoms/AtomLabel";
import AtomParagraph from "@/components/atoms/AtomParagraph";

import { errorMessages } from "@/services/form-error-messages";
export default {
    props: {
        id:             { type: String },
        classList:      { type: String },
        field:          {
                            type: String,
                            required: true,
                            validator(value) {
                                //matches a single camelCase word
                                return value.match(/^[a-zA-Z]+$/);
                            }
                        },
        label:          { type: String, required: true },
        hasErrors:      { type: Boolean },
        modelValue:     { type: String },
        disabled:       { type: Boolean },
        optional:       { type: Boolean },
        // validation has to be the vuelidate object of the property (i.e. v$.name)
        validation:     { type: Object },
        small:          { type: Boolean }
    },

    components: {
        AtomInputText,
        AtomLabel,
        AtomParagraph,
    },

    methods: {
        getErrorMessage(property, validator) {
            console.log(property);
            console.log(validator);
            console.log(errorMessages[`${property}_${validator}`]);
            console.log(errorMessages[property]);

            return  errorMessages[`${property}_${validator}`] ||
                    errorMessages[property]
        }
    }
};
</script>