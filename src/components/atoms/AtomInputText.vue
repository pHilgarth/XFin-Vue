<template>
        <input v-bind="additionalProps" :value="modelValue" @input="$emit('update:modelValue', $event.target.value)" type="text" @blur="$emit('blur')" />
</template>

<script>
export default {
    props: {
        modelValue: { type: String, required: true },
        additionalProps: { type: Object },
    },
};
</script>