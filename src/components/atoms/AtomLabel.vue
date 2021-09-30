<template>
    <label :id="id" :class="classList" :for="target" v-bind="additionalProps">{{ text }}</label>
</template>

<script>
export default {
    props: {
        id:                 { type: String },
        classList:          { type: String },
        target:             { type: String },
        text:               {
                                type: String,
                                required: true
                            },

        additionalProps:    { type: Object },
    },
};
</script>