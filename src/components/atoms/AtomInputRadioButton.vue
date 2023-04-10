<template>
  <div class="atom-input-radio-button">
    <input :id="id" type="radio" :name="group" :checked="checked" @change="$emit('change', $event)" />
    <label :for="id">{{ label }}</label>
  </div>
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