<template>
  <component :id="id" :class="classList" :is="tag">
    {{ text }}
  </component>
</template>

<script>
export default {
  props: {
    id:           { type: String },
    classList:    { type: String },
    tag:          {
                    type: String,
                    required: true,
                    validator(value) {
                        return value.match(/h[1-6]/);
                    }
                  },
    text:         { type: String, required: true },
  },
};
</script>