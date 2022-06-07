<template>
    <div :class="`molecule-input-checkbox form-check ${_switch ? 'form-switch ' : ''}`">
        <AtomInputCheckbox :id="field" :checked="modelValue" @input="$emit('update:modelValue', $event.target.checked)"
                           :disabled="disabled"/>
        <AtomLabel class="xfin__form__label" :for="field" :text="label" />
    </div>
</template>

<script>
import AtomInputCheckbox from '@/components/atoms/AtomInputCheckbox';
import AtomLabel from '@/components/atoms/shared/AtomLabel';

export default {
    props: {
        field:              { type: String },
        modelValue:         { type: Boolean, required: true },
        label:              { type: String, required: true },
        //if true, component will render as a 'on-off'-switch
        _switch:            { type: Boolean },
        disabled:           { type: Boolean },
    },

    components: {
        AtomInputCheckbox,
        AtomLabel,
    },

    data() {
        return { counter: 0 };
    },
};
</script>