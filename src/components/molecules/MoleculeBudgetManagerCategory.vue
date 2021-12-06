<template>
  <div class="xfin-card budget-manager__category" :class="{ 'changed' : category.dirty }">
    <div class="xfin-card__content col-8">
      <span>{{ category.name }}</span>
    </div>
    <div class="xfin-card__content col-2">
      <AtomBudgetManagerInput :valueProp="category.balance" @amount-changed="$emit('amount-changed', $event, category)" />
    </div>
    <div class="xfin-card__content col-2">
      <i v-if="category.dirty" class="bi bi-arrow-counterclockwise reset" title="Zurücksetzen" @click="resetCategory(category)"></i>
      <i v-if="category.dirty" class="bi bi-check-circle save" title="Änderung speichern" @click="saveCategory(category)"></i>
    </div>
  </div>
</template>

<script>
import AtomBudgetManagerInput from '@/components/atoms/AtomBudgetManagerInput';

export default {
  components: {
    AtomBudgetManagerInput,
  },

  props: {
    category: { type: Object, required: true },
  },

  // methods: {
  //   processAmount(event, category) {
  //     this.category.balance = event;
  //     console.log(event);
  //     console.log(category);
  //   }
  // }
};
</script>