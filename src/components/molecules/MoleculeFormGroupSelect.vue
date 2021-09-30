<template>
    <div class="row">
        <AtomLabel classList="col-3" :target="field.toLowerCase()" :text="`${field}:`" />
    </div>
</template>

<script>
import AtomInputText from "@/components/atoms/AtomInputText";
import AtomLabel from "@/components/atoms/AtomLabel";
import AtomParagraph from "@/components/atoms/AtomParagraph";

import { errorMessages } from "@/services/form-error-messages";
export default {
    props: {
        field:          {
                            type: String,
                            required: true,
                            validator(value) {
                                //matches a single camelCase word
                                return value.match(/^[a-zA-Z]+$/)
                            }
                        },
        hasErrors:      {
                            type: String,
                            validator(value) {
                                //matches "has-errors" or ""
                                return value.match(/^(has-errors){0,1}/)
                            }
                        },
        modelValue:     { type: String, required: true },
        disabled:       { type: Boolean, required: true },
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