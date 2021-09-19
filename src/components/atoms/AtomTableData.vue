<template>
    <td v-if="config.content" v-html="config.content" v-bind="config.props"></td>

    <td v-else-if="config.component" v-bind="config.props">
        <component v-if="config.component.content" :is="config.component.tag" v-bind="config.component.props" v-html="config.component.content" />
        <component v-else :is="config.component.tag" v-bind="config.component.props" /> 
    </td>
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