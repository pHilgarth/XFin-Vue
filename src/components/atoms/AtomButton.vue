<template>
  <button :class="`xfin__button ${getTypes()}`">{{ text }}</button>
</template>

<script>
import { buttonService } from '@/services/button-types';

export default {
  props: {
    text: {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: true,
      validator: (value) => buttonService.buttonTypes.indexOf(value) !== -1
    },
  },

  methods: {
    getTypes() { return buttonService.getCssClassesForTypes(this.type); }
  }
};
</script>