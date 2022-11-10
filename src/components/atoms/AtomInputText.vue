<template>
  <input class="atom-input-text" :type="type" :autocomplete="autocomplete" />
</template>

<script>

export default {
  props: {
    autocomplete: { type: String, required: true },
    type:         { type: String, default: 'text' },
  },
};

</script>