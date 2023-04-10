<template>
  <div class="molecule-transaction-type">
    <AtomInputRadioButton v-for="transactionType in transactionTypes" :key="transactionType.id" :checked="transactionType.id === 'Revenue'"
                          group="transaction-type" :id="transactionType.id" :label="transactionType.label" @change="$emit('change', $event)"
    />
  </div>
</template>

<script>
import AtomInputRadioButton from '@/components/atoms/AtomInputRadioButton';

import { transactionTypeService } from "@/services/transaction-type-service";

export default {
  components: {
    AtomInputRadioButton
  },

  data() {
    return {
      transactionTypes: transactionTypeService.transactionTypes,
    }
  },

  emits: [ 'change' ],

  props: {
    preselectedOptionId: { type: String, required: true },
  },
};

</script>