<template>
    <button :disabled="disabled" v-bind="additionalProps">{{ text }}</button>
</template>

<script>
export default {
    props: {
        text:               {
                                type: String,
                                required: true,
                            },
        disabled:           { type: Boolean },
        additionalProps:    { type: Object },
    },
};
</script>