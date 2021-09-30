<template>
  <input
    type="text"
    :id="id"
    :class="classList"
    :value="value"
    :placeholder="placeholder"
    v-bind="additionalProps"
  />
</template>

<script>
export default {
  props: {
    id:               { type: String },
    classList:        { type: String },
    value:            { type: String, required: true },
    disabled:         { type: Boolean },
    placeholder:      { type: String },
                      
    additionalProps:  { type: Object },
  },
};
</script>