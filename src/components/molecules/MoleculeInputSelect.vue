<template>
    <div class="form-floating pb-5" :class="classList" :id="id">
        <AtomInputSelect classList="form-select" :id="field.toLowerCase()" :value="modelValue" :options="options" @input="$emit('update:modelValue', $event.target.value)" />
        <AtomLabel classList="xfin-form__label" :target="field.toLowerCase()" text="Quelle" />
        <!-- <template v-for="(error, index) in validation?.$errors" :key="index">
            <AtomParagraph classList="xfin-form__error" :text="getErrorMessage(error.$property, error.$validator)" />
        </template> -->
    </div>
</template>

<script>
import { errorMessages } from "@/services/form-error-messages";

import AtomInputSelect from "@/components/atoms/AtomInputSelect";
import AtomLabel from "@/components/atoms/AtomLabel";

export default {
    props: {
        classList: { type: String },
        id: { type: String },
        field: { type: String },
        options: {
            type: Array,
            required: true,
        },
        modelValue:     { type: String, required: true },
        // validation:     { type: Object },
        // Validation has to be the vuelidate object of the property (i.e. v$.name)
    },

    components: {
        AtomInputSelect,
        AtomLabel,
    },

    data() {
        return { counter: 0 }
    },

    methods: {
        getErrorMessage(property, validator) {
            return  errorMessages[`${property}_${validator}`] ||
                    errorMessages[property]
        },
        
        //TODO - remove if really not needed
        // optionChanged(event) {
        //     this.$emit('option-changed', event);
        // }
    }
};
</script>