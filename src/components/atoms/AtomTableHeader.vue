<template>
    <th v-bind="config.props">{{ config.content }}</th>
</template>

<script>
export default {
    props: {
        config: {
            type: Object,
            required: true
        },
    },
}
</script>