<template>
  <select class="atom-input-select form-select xfin__form__form-control">
    <option v-for="(option, key) in options" :key="key" :value="option.value || option.label || key" :disabled="option.disabled">
      {{ option.label || option.value || option }}
    </option>
  </select>
</template>

<script>
export default {
  props: {
    options: {
      type: Array,
      required: true
    },
  },
}
</script>