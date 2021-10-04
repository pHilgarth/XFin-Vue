<template>
    <button :id="id" :class="classList" :disabled="disabled" v-bind="additionalProps">{{ text }}</button>
</template>

<script>
export default {
    props: {
        id:                 { type: String },
        classList:          { type: String },
        text:               {
                                type: String,
                                required: true,
                            },
        disabled:           { type: Boolean },
        additionalProps:    { type: Object },
    },
};
</script>