<template>
    <span class="dev-hint">this component is unsing the v-html directive - make sure it always gets trusted content!</span>
    <li v-if="config.content" v-html="config.content" v-bind="config.props"></li>

    <li v-else-if="config.component">
        <component v-if="config.component.content" :is="config.component.tag" v-bind="config.props" v-html="config.component.content" />
        <component v-else :is="config.component.tag" v-bind="config.props" />        
    </li>
</template>

<script>
export default {
    props: {
        config: {
            type: Object,
            required: true,
        }
    }
}
</script>