<template>
  <!-- TODO - this component is using the v-html directive - make sure it always gets trusted content! -->
  <span v-html="text"></span>
</template>

<script>
export default {
    props: {
        text: { type: String, required: true, },
    },
};
</script>