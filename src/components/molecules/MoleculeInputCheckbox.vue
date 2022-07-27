<template>
    <div :class="`molecule-input-checkbox form-check ${renderAsSwitch ? 'form-switch ' : ''}`">
        <AtomInputCheckbox :id="field" :checked="modelValue" @input="$emit('update:modelValue', $event.target.checked)"
                           :disabled="disabled"/>
        <AtomLabel class="xfin__form__label" :for="field" :text="label" />
    </div>
</template>

<script>
import AtomInputCheckbox from '@/components/atoms/AtomInputCheckbox';
import AtomLabel from '@/components/atoms/AtomLabel';

export default {
    props: {
        field:              { type: String },
        renderAsSwitch:     { type: Boolean },
        disabled:           { type: Boolean },

        modelValue: {
          type: Boolean,
          required: true
        },
        label: {
          type: String,
          required: true
        },
    },

    components: {
        AtomInputCheckbox,
        AtomLabel,
    },
};
</script>