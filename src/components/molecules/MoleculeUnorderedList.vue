<template>
    <ul>
        <AtomListItem v-for="item in config.items" :key="item" :config="item.content || item.component" />
    </ul>
</template>

<script>
import AtomListItem from "@/components/atoms/AtomListItem";


export default {
    components: {
        AtomListItem,
    },

    props: {
        config: {
            type: Object,
            required: true,
        }
    },
}
</script>