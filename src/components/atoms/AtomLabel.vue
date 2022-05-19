<template>
  <!-- TODO - this component is using the v-html directive - make sure it always gets trusted content! -->
  <label v-html="text"></label>
</template>

<script>
export default {
  props: {
    text: { type: String, required: true, },
  },
};
</script>