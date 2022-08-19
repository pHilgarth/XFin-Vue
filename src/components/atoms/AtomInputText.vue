<template>
  <input class="atom-input-text" :type="type" />

</template>

<script>

export default {
  props: {
    type: { type: String, default: 'text' },
  },
};

</script>