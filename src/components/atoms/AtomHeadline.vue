<template>
  <component :is="tag">
    {{ text }}
  </component>
</template>

<script>
export default {
  props: {
    tag: {
      type: String,
      required: true,
      validator: (value) => ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].indexOf(value) !== -1
    },
    text: {
      type: String,
      required: true
    },
  },
};
</script>