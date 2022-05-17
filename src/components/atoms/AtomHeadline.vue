<template>
  <component :is="tag">
    {{ text }}
  </component>
</template>

<script>
export default {
  props: {
    tag:    { type: String, required: true },
    text:   { type: String, required: true },
  },
};
</script>