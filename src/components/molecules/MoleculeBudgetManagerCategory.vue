<template>
  <div class="xfin-card budget-manager__category" :class="{ 'changed' : category.dirty }">
    <div class="xfin-card__content col-8 budget-manager__category__name">
      <span>{{ category.name }}</span>
    </div>
    <div class="xfin-card__content col-2 budget-manager__category__balance">
      <!-- TODO - don't use another Atom here - just use AtomInputText and copy the methods from AtomBudgetManagerInput-->
      <AtomInputText :class="`xfin-form__control form-control text-right ${hasErrors ? 'has-errors' : ''}`" :value="modelValue" :disabled="disabled" @input="processInput" />
      <template v-for="(error, index) in validation?.$errors" :key="index">
        <AtomParagraph class="xfin-form__error" :text="getErrorMessage(error.$property, error.$validator, errorMessageParams)" />
      </template>
    </div>
  </div>
</template>

<script>
import AtomInputText from '@/components/atoms/AtomInputText';
import AtomParagraph from "@/components/atoms/AtomParagraph";

import { NumberService } from '@/services/number-service';

import { errorMessages } from "@/services/form-error-messages";

export default {
  components: {
    AtomInputText,
    AtomParagraph,
  },

  props: {
    category: { type: Object, required: true },
    disabled: { type: Boolean },
    hasErrors: { type: Boolean },
    modelValue: { type: String },
    validation: { type: Object },
    errorMessageParams: { type: Object }
  },

  methods: {
    processInput(event) {
      const caretPosition = event.target.selectionStart;
      const lengthBefore = event.target.value.length;

      if (this.validateInput(event)) {
        const negative = NumberService.parseFloat(event.target.value) < 0;
        let value = negative ? event.target.value.slice(1) : event.target.value;

        //TODO - move this formatting code into a service (this code formats the value and places the thounsand separators appropriatly
        //after every input, we format the value
        let formattedValue = value.replaceAll(".", "");
        let valueArray = formattedValue.split(',');

        if (valueArray.length === 2) {
          valueArray[1] = valueArray[1].length > 2 ? valueArray[1].slice(0, 2) : valueArray[1];
        }

        //first we place the thousand separators - we need to reverse it, so we can count up in the loop and set a thousand separator after every third number
        //also we need to copy it, so the length won't change during the loop
        const reversedIntPart = valueArray[0].split('').reverse().join('');
        let triplets = [];
        let triplet = '';

        for (let i = 0; i < reversedIntPart.length; i++) {
          triplet += reversedIntPart.split('')[i];
          if ((i > 1 && (i + 1) % 3 === 0)) {
            triplets.push(triplet);triplet='';
          }
          else if (i === reversedIntPart.length - 1) {
            triplets.push(triplet);
          }
        }

        valueArray[0] = (`${triplets.join('.')}`).split('').reverse().join('');

        formattedValue = negative ? `-${valueArray.join(',')}` : valueArray.join(',');

        const lengthAfter = formattedValue.length;

        event.target.value = formattedValue;

        event.target.selectionStart = caretPosition + (lengthAfter - lengthBefore);
        event.target.selectionEnd = caretPosition + (lengthAfter - lengthBefore);

        this.$emit('amount-changed', event.target.value, this.category);
      }
      else {
        event.target.value = this.value;
        event.target.selectionStart = caretPosition - 1;
        event.target.selectionEnd = caretPosition - 1;
      }
    },

    getErrorMessage(property, validator, params) {
      let errorMessage = errorMessages[`${property}_${validator}`] || errorMessages[property];

      for (const key in params) {
        errorMessage = errorMessage.replace(`{${key}}`, params[key]);
      }

      //TODO - implement error handling: if the error message contains {...} substrings, but no params were passed to this function, return an empty errorMessage to prevent outputting weird strings

      console.log(`errorMessage after: ${errorMessage} (${typeof errorMessage})`);
      return errorMessage;
      // return  errorMessages[`${property}_${validator}`] ||
      //         errorMessages[property]
    },

    validateInput(event) {
      //valid input are numbers, comma and backspace
      //event.data is null when backspace was pressed or if something was pasted into the input
      //if something was pasted, it has to be a completely valid amount, thus the regex

      return (
              event.data === null && (
                  event.target.value === "" || event.target.value.match(/^-?[0-9.]*,{0,1}[0-9]*$/)))
          || event.data !== null && event.data.match(/[0-9]+/) || event.data === ',';
    },
  }
};
</script>