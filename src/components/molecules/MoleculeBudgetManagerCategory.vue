<template>
  <!-- TODO - .molecule__card classes doesnt belong here, check what they do and maybe extend .molecule-budget-manager-category or else -->
  <div class="molecule-budget-manager-category" :class="{ 'changed': category.dirty, 'show-detail': showDetail }">
    <div class="molecule-budget-manager-category__header">
      <div class="col-8">
        <AtomSpan :text="category.name" />
      </div>

      <div class="col-2 molecule-budget-manager-category__balance">
        <AtomInputText :class="`xfin__form__form-control form-control text-right ${hasErrors ? 'has-errors' : ''}`" :value="value" :disabled="disabled"  @input="processInput"/>
        <template v-for="(error, index) in validation?.$errors" :key="index">
          <MoleculeFormError :error="error" :errorMessageParams="errorMessageParams" />
        </template>
      </div>

      <div v-if="category.dirty" class="molecule-budget-manager-category__reset" title="Zurücksetzen" @click="$emit('reset', category)">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-counterclockwise" viewBox="0 0 16 16">
          <path fill-rule="evenodd" d="M8 3a5 5 0 1 1-4.546 2.914.5.5 0 0 0-.908-.417A6 6 0 1 0 8 2v1z"/>
          <path d="M8 4.466V.534a.25.25 0 0 0-.41-.192L5.23 2.308a.25.25 0 0 0 0 .384l2.36 1.966A.25.25 0 0 0 8 4.466z"/>
        </svg>
      </div>

      <div @click="showDetail = !showDetail">Detailansicht</div>
    </div>
    <hr />
    <!-- TODO -- implement detail view in a separate component -->
<!--    <div>-->
<!--      <ul>-->
<!--        <li>Sample</li>-->
<!--        <li>Sample</li>-->
<!--        <li>Sample</li>-->
<!--        <li>Sample</li>-->
<!--        <li>Sample</li>-->
<!--        <li>Sample</li>-->
<!--        <li>Sample</li>-->
<!--        <li>Sample</li>-->
<!--        <li>Sample</li>-->
<!--        <li>Sample</li>-->
<!--      </ul>-->
<!--    </div>-->
  </div>
</template>

<script>
import AtomInputText from '@/components/atoms/AtomInputText';
import AtomSpan from '@/components/atoms/AtomSpan';

import MoleculeFormError from "@/components/molecules/shared/MoleculeFormError";

import { numberService } from '@/services/number-service';
import { errorService } from "@/services/form-error-service";

export default {
  components: {
    AtomInputText,
    AtomSpan,
    MoleculeFormError,
  },

  props: {
    disabled:           { type: Boolean },
    hasErrors:          { type: Boolean },
    value:              { type: String },
    validation:         { type: Object },
    errorMessageParams: { type: Object },

    category: {
      type: Object,
      required: true
    },
  },

  data() {
    return {
      showDetail:   false,
      errorService: errorService,
    };
  },

  methods: {
    processInput(event) {
      const caretPosition = event.target.selectionStart;
      const lengthBefore = event.target.value.length;

      if (numberService.validateBudgetInput(event)) {
        const formattedValue = numberService.formatBudget(event.target.value);
        const lengthAfter = formattedValue.length;

        event.target.value = formattedValue;

        const selection = caretPosition + (lengthAfter - lengthBefore);
        event.target.selectionStart = selection < 0 ? 0 : selection;
        event.target.selectionEnd = selection < 0 ? 0 : selection;

        this.$emit('amount-changed', event.target.value, this.category);
      } else {
        event.target.value = this.value;
        event.target.selectionStart = caretPosition - 1;
        event.target.selectionEnd = caretPosition - 1;
      }
    },
  }
};
</script>