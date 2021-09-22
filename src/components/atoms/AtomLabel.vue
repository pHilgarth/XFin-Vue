<template>
    <label v-bind="props">{{ text }}</label>
</template>

<script>
export default {
    props: {
        props: { type: Object },
        text: {
            type: String,
            required: true
        },
    },
};
</script>