<template>
  <div class="xfin-card budget-manager__category" :class="{ 'changed': category.dirty, 'show-detail': showDetail }">
    <div class="budget-manager__category-header">
      <div class="xfin-card__content col-8 budget-manager__category__name">
        <span>{{ category.name }}</span>
      </div>
      <div class="xfin-card__content col-2 budget-manager__category__balance">
        <!-- TODO - don't use another Atom here - just use AtomInputText and copy the methods from AtomBudgetManagerInput-->
        <!-- <AtomInputText  :class="`xfin-form__control form-control text-right ${hasErrors ? 'has-errors' : ''}`" :value="balance" :disabled="disabled" -->
        <!-- <AtomInputText  :class="`xfin-form__control form-control text-right ${hasErrors ? 'has-errors' : ''}`" :value="modelValue" :disabled="disabled" -->
        <AtomInputText :class="`xfin-form__control form-control text-right ${hasErrors ? 'has-errors' : ''}`"
                       :value="value" :disabled="disabled"
                       @input="processInput"/>
        <template v-for="(error, index) in validation?.$errors" :key="index">
          <AtomParagraph class="xfin-form__error"
                         :text="getErrorMessage(error.$property, error.$validator, errorMessageParams)"/>
        </template>
      </div>
      <div v-if="category.dirty" class="budget-manager__category__reset" title="Zurücksetzen"
           @click="$emit('reset', category)">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
             class="bi bi-arrow-counterclockwise" viewBox="0 0 16 16">
          <path fill-rule="evenodd" d="M8 3a5 5 0 1 1-4.546 2.914.5.5 0 0 0-.908-.417A6 6 0 1 0 8 2v1z"/>
          <path d="M8 4.466V.534a.25.25 0 0 0-.41-.192L5.23 2.308a.25.25 0 0 0 0 .384l2.36 1.966A.25.25 0 0 0 8 4.466z"/>
        </svg>
      </div>
      <div class="budget-manager__detail" @click="showDetail = !showDetail">Detailansicht</div>
    </div>
    <hr />
    <div class="budget-manager__category-detail">
      <ul>
        <li>Sample</li>
        <li>Sample</li>
        <li>Sample</li>
        <li>Sample</li>
        <li>Sample</li>
        <li>Sample</li>
        <li>Sample</li>
        <li>Sample</li>
        <li>Sample</li>
        <li>Sample</li>
      </ul>
    </div>
  </div>
</template>

<script>
import AtomInputText from '@/components/atoms/AtomInputText';
import AtomParagraph from "@/components/atoms/AtomParagraph";

import {NumberService} from '@/services/number-service';

import {errorMessages} from "@/services/form-error-messages";

export default {
  components: {
    AtomInputText,
    AtomParagraph,
  },

  props: {
    category: {type: Object, required: true},
    disabled: {type: Boolean},
    hasErrors: {type: Boolean},
    //modelValue: { type: Number },
    //modelValue: { type: String },
    value: {type: String},
    validation: {type: Object},
    errorMessageParams: {type: Object}
  },

  // computed: {
  //   balance() {
  //     return NumberService.formatCurrency(this.modelValue, false);
  //   }
  // },

  data() {
    return {
      showDetail: false,
    }
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

        //TODO - delete this whole commented block, when everything is working without it, the validation should already take care of too much decimals
        //if the value has decimal places, valueArray.length is 2
        //if (valueArray.length === 2) {
        //after the split operation the decimal part is at index 1 - if the decimal part exceeds the length 2, the additional decimal places are cut off
        //valueArray[1] = valueArray[1].length > 2 ? valueArray[1].slice(0, 2) : valueArray[1];
        //}

        //first we place the thousand separators - we need to reverse it, so we can count up in the loop and set a thousand separator after every third number
        //also we need to copy it, so the length won't change during the loop
        const reversedIntPart = valueArray[0].split('').reverse().join('');
        let triplets = [];
        let triplet = '';

        for (let i = 0; i < reversedIntPart.length; i++) {
          triplet += reversedIntPart.split('')[i];
          if ((i > 1 && (i + 1) % 3 === 0)) {
            triplets.push(triplet);
            triplet = '';
          } else if (i === reversedIntPart.length - 1) {
            triplets.push(triplet);
          }
        }

        valueArray[0] = (`${triplets.join('.')}`).split('').reverse().join('');

        formattedValue = negative ? `-${valueArray.join(',')}` : valueArray.join(',');

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

    getErrorMessage(property, validator, params) {
      let errorMessage = errorMessages[`${property}_${validator}`] || errorMessages[property];

      for (const key in params) {
        errorMessage = errorMessage.replace(`{${key}}`, params[key]);
      }

      //TODO - implement error handling: if the error message contains {...} substrings, but no params were passed to this function, return an empty errorMessage to prevent outputting weird strings
      return errorMessage;
      // return  errorMessages[`${property}_${validator}`] ||
      //         errorMessages[property]
    },

    validateInput(event) {
      //TODO - i forgot to handle the delete key press
      //valid input are numbers, comma and backspace
      //event.data is null when backspace was pressed or if something was pasted into the input
      //if something was pasted, it has to be a completely valid amount, thus the regex

      //i have to remove the dots for proper regex checking
      const value = event.target.value.replaceAll('.', '');

      return value.match(/^-?([0-9]*,?[0-9]{0,2}|[0-9]{1,3}\.|[0-9]{1,3}(\.[0-9]{3})+(,[0-9]{0,2})?)$/);

      // return  (event.data === null &&
      //           (event.target.value === "" || event.target.value.match(/^-?([0-9]*,?[0-9]{0,2}|[0-9]{1,3}\.|[0-9]{1,3}(\.[0-9]{3})+(,[0-9]{0,2})?)$/))
      //         )
      //         ||
      //         event.data !== null && event.data.match(/[0-9]+/) || event.data === ',';

      //TODO - move this regex documentation into a doc file
      //these are the teststrings for the long regex above, paste them in regex101.com to see what the reges is doing
      // müssen matchen:
      //   -
      //   -0
      //   -3
      //   -6
      //   ,54
      //   -0,43
      //   0,4
      //   -4,
      //   -00
      //   9
      //   -1239876987698769876987689767676
      //   123
      //   123.
      //   1.
      //   12.
      //   12
      //   -123456,
      //   -123456,5
      //   -123456,67
      //   1.250
      //   1.234,
      //   1.234,6
      //   1.234,67

      //   dürfen nicht matchen:
      //   ..
      //   ,,
      //   --
      //   123..234,34
      //   123,454,54
      //   .234
      //   ,345
      //   1.40,34
      //   123,2.3
      //   123.12323
      //   123.,23
      //   0,456
      //   123.123123,45
      //   1234.234,45
      //   123.2.234444444.
      //   -213456,654
      //   1,234,67
      //   1.234,567
      //   12.345,678
    },
  }
};
</script>