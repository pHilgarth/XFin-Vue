<template>
    <p :id="id" :class="classList" v-bind="additionalProps">{{ text }}</p>
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

        additionalProps:    { type: Object },
    },
};
</script>