<template>
  <input :id="id" type="radio" :name="group" class="atom-input-radio-button" :checked="checked" @change="$emit('change', $event)" />
  <label :for="id">{{ label }}</label>
</template>

<script>

export default {
  emits: [ 'change' ],

  props: {
    group: { type: String, required: true },
    id: { type: String, required: true },
    label: { type: String, required: true },
    checked: { type: Boolean, default: false },
  },
};

</script>