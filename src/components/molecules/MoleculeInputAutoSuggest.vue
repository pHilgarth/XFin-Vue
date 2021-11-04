<template>
    <div class="form-floating" :class="classList" :id="id">
    <AtomInputText  :id="field" :disabled="disabled" :value="modelValue" :placeholder="label"
                    :classList="`xfin-form__control form-control col-4 ${hasErrors ? 'has-errors' : ''}`"
                    @blur="$emit('blur')" @input="onInput" />
                    
    <AtomLabel classList="xfin-form__label" :target="field" :text="`${label}${optional ? '' : ' <i>*</i>'}`" />
    <ul style="list-style-type: none;">
        <li v-for="(suggestion, index) in suggestions" :key="index">{{ suggestion }}</li>
    </ul>

    <template v-for="(error, index) in validation?.$errors" :key="index">
        <AtomParagraph classList="xfin-form__error" :text="getErrorMessage(error.$property, error.$validator)" />
    </template>
    {{ modelValue }}
    {{ items }}
</div>
</template>

<script>
import AtomInputText from "@/components/atoms/AtomInputText";
import AtomLabel from "@/components/atoms/AtomLabel";
import AtomParagraph from "@/components/atoms/AtomParagraph";

import { errorMessages } from "@/services/form-error-messages";
export default {
    //TODO - refactor props - i might not need all of them - just copied from MoleculeInputText
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
        small:          { type: Boolean },
        items:          { type: Array, required: true }
    },

    components: {
        AtomInputText,
        AtomLabel,
        AtomParagraph,
    },

    watch: {
        modelValue() {
            this.suggestions = this.modelValue === '' ? [] : this.items.filter(i => i.startsWith(this.modelValue));
        }
    },

    data() {
        return {
            // items: [
            //     'Aldi', 'Alkohol', 'Alfons',
            //     'Berni', 'Bethlehem', 'Behindert',
            //     'Cool', 'Corny', 'Cornflakes',
            // ],
            suggestions: []
        }
    },

    methods: {
        onInput(event) {
            this.input = event.target.value;
            this.suggestions = this.items.filter(i => i.startsWith(event.target.value));
            this.$emit('update:modelValue', event.target.value);
        },

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