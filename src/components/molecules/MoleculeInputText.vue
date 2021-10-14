<template>
    <div class="form-floating pb-5" :class="classList">
        <AtomInputText  :id="field.toLowerCase()" :disabled="disabled" :placeholder="field" :value="modelValue"
                        :classList="`xfin-form__control form-control col-4 ${hasErrors ? 'has-errors' : ''}`"
                        @blur="$emit('blur')" @input="$emit('update:modelValue', $event.target.value)" />
                        
        <AtomLabel classList="xfin-form__label" :target="field.toLowerCase()" :text="`${field}${optional ? '' : ' <i>*</i>'}`" />

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
        hasErrors:      { type: Boolean },
        modelValue:     { type: String },
        disabled:       { type: Boolean },
        optional:       { type: Boolean },
        validation:     { type: Object },
        // Validation has to be the vuelidate object of the property (i.e. v$.name)
    },

    components: {
        AtomInputText,
        AtomLabel,
        AtomParagraph,
    },

    data() {
        return { counter: 0 }
    },

    methods: {
        getErrorMessage(property, validator) {
            return  errorMessages[`${property}_${validator}`] ||
                    errorMessages[property]
        }
    }
};
</script>