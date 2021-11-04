<template>
    <div class="form-floating" :class="classList" :id="id">
        <AtomInputSelect :id="field" :value="modelValue" :options="options" @input="$emit('update:modelValue', $event.target.value)" />
        <AtomLabel classList="xfin-form__label" :target="field" :text="label" />
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
        modelValue:     { type: [String, Number], required: true },
        label:          { type: String, required: true },
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