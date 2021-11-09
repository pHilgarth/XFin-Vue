<template>
    <span :id="id" :class="classList" v-bind="additionalProps" v-html="text"></span>
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