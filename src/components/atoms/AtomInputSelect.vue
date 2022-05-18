<template>
  <select class="form-select xfin-form__control">
    <option v-for="(option, index) in options" :key="index" :value="option.value" :disabled="option.disabled">
      {{ option.value }}
    </option>
  </select>
</template>

<script>
export default {
  props: {
    options: { type: Array, required: true },
  },
}
</script>