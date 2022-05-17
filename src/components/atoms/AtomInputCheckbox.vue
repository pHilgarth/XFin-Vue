<template>
  <input type="checkbox" :id="id" class="form-check-input" :checked="checked" @input="$emit('input')" />
</template>

<script>
export default {
  emits: [
      'input',
  ],

  props: {
    id:       { type: String },
    checked:  { type: Boolean, default: false},
  },
};
</script>