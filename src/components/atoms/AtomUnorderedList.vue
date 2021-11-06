<template>
    <ul :id="id" :class="classList">
        <li v-for="(item, index) in items" :key="index" @click="$emit('itemClicked', $event)" @mouseenter="$emit('itemMouseenter')"
            @mouseleave="$emit('itemMouseleave')" v-html="item"></li>
    </ul>
</template>

<script>
export default {
    props: {
        id:         { type: String },
        classList:  { type: String },

        items:      { type: Array, required: true },
    }
}
</script>