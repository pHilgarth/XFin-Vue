<template>
    <div :class="`form-check ${_switch ? 'form-switch ' : ''}${classList}`" :id="id">
        <AtomInputCheckbox :id="field" :checked="modelValue" @input="$emit('update:modelValue', $event.target.checked)"
                           :disabled="disabled"/>
        <AtomLabel class="xfin-form__label" :for="field" :text="label" />
        <template v-for="(error, index) in validation?.$errors" :key="index">
            <AtomParagraph class="xfin-form__error" :text="getErrorMessage(error.$property, error.$validator)" />
        </template>
    </div>
</template>

<script>
import { errorMessages } from '@/services/form-error-messages';

import AtomInputCheckbox from '@/components/atoms/AtomInputCheckbox';
import AtomLabel from '@/components/atoms/AtomLabel';
import AtomParagraph from '@/components/atoms/AtomParagraph';

export default {
    props: {
        classList:          { type: String },
        id:                 { type: String },
        field:              { type: String },
        modelValue:         { type: Boolean, required: true },
        label:              { type: String, required: true },
        validation:         { type: Object },
        //if true, component will render as a 'on-off'-switch
        _switch:            { type: Boolean },
        disabled:           { type: Boolean },
    },

    components: {
        AtomInputCheckbox,
        AtomLabel,
        AtomParagraph
    },

    data() {
        return { counter: 0 }
    },

    methods: {
        getErrorMessage(property, validator) {
            return  errorMessages[`${property}_${validator}`] ||
                    errorMessages[property]
        },
    }
};
</script>