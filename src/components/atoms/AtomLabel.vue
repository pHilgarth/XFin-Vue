<template>
    <label v-html="text"></label>
</template>

<script>
export default {
  props: {
    text: { type: String, required: true, },
  },
};
</script>