<template>
    <p v-bind="additionalProps">{{ text }}</p>
</template>

<script>
export default {
    props: {
        text:               { type: String, required: true },
        additionalProps:    { type: Object },
    },
};
</script>