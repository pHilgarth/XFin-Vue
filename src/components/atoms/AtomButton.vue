<template>
    <button :class="getType" :disabled="disabled" v-bind="additionalProps">{{ text }}</button>
</template>

<script>
export default {
    props: {
        text:               {
                                type: String,
                                required: true,
                            },
        disabled:           { type: Boolean },
        additionalProps:    { type: Object },
    },

  methods: {
      getType() {
        switch (this.type) {
          case 'btn-primary':
            return 'xfin__button--primary';
          case 'btn-light':
            return 'xfin__button--light';
        }
      }
  }
};
</script>