<template>
  <AtomParagraph class="xfin__form__error" :text="errorService.getErrorMessage(error.$property, error.$validator, errorMessageParams)" />
</template>

<script>
import AtomParagraph from '@/components/atoms/AtomParagraph';

import { errorService } from '@/services/form-error-service';

export default {
  props: {
    errorMessageParams: { type: Object },

    error: {
      type: Object,
      required: true,
    },
  },

  components: {
    AtomParagraph
  },

  data() {
    return {
      errorService: errorService,
    };
  },
};
</script>