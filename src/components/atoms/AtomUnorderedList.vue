<template>
  <!-- TODO - this component is using the v-html directive - make sure it always gets trusted content! -->
  <ul class="atom-unordered-list">
    <li v-for="item in items" :key="item.id" :id="item.id"
        @click="$emit('itemClicked', $event)" @mouseenter="$emit('itemMouseenter')" @mouseleave="$emit('itemMouseleave')">
      {{ item.label }}
    </li>
  </ul>
</template>

<script>
export default {
  props: {
    items: {
      type: Array,
      required: true
    },
  }
}
</script>