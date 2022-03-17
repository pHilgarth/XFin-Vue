<template>
    <button :class="`xfin__button ${getType()}`" :disabled="disabled" v-bind="additionalProps">{{ text }}</button>
</template>

<script>
export default {
    props: {
        text:               { type: String, required: true },
        type:               { type: String, required: true },
        disabled:           { type: Boolean },
        additionalProps:    { type: Object },
    },

  methods: {
      getType() {
        switch (this.type) {
          case 'primary':
            return 'xfin__button--primary';
          case 'primary-small':
            return 'xfin__button--primary xfin__button--small';
          case 'light':
            return 'xfin__button--light';
          case 'cancel':
            return 'xfin__button--cancel';
          case 'cancel-small':
            return 'xfin__button--cancel xfin__button--small';
        }
      }
  }
};
</script>