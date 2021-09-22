<template>
    <p v-bind="props">{{ text }}</p>
</template>

<script>
export default {
    props: {
        props: {
            type: Object,
            required: false,
        },
        text: {
            type: String,
            required: false,
        },
    },
};
</script>