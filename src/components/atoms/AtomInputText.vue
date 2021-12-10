<template>
  <input
    type="text"
    :id="id"
    :class="classList"
    :value="value"
    :disabled="disabled"
    :placeholder="placeholder"
    v-bind="additionalProps"
  />
</template>

<script>
export default {
  //TODO - remove id and classList and update components using this Atom accordingly
  props: {
    id:               { type: String },
    classList:        { type: String },
    value:            { type: String },
    disabled:         { type: Boolean },
    placeholder:      { type: String },
                      
    additionalProps:  { type: Object },
  },
};
</script>