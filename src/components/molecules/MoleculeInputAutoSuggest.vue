<template>
  <div class="molecule-input-auto-suggest form-floating">

    <AtomInputText :id="field" :disabled="disabled" :value="inputValue" :placeholder="label"
                   :classList="`xfin__form__form-control form-control molecule-input-auto-suggest__input col-4${hasErrors ? ' has-errors' : ''}`"
                   autocomplete="off" @blur="onBlur" @input="onInput" @focus="inputHasFocus = true"/>

    <div class="molecule-input-auto-suggest__chevron">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-down" viewBox="0 0 16 16">
        <path fill-rule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/>
      </svg>
    </div>
    <AtomLabel class="xfin__form__label" :for="field" :text="`${label} <i>*</i>`"/>
    <!-- TODO - hide ul again, if input looses focus (on blur?) -> this is almost done! But if I hover on an element and then press tab, the box wont disappear, thats a cornercase but maybe i can fix it. I would need to track if TAB was pressed i guess-->
    <AtomUnorderedList v-if="inputHasFocus" class="molecule-input-auto-suggest__suggestions"
                       :items="suggestions" @itemClicked="pickItem"
                       @itemMouseenter="hoverOnItem = true" @itemMouseleave="hoverOnItem = false"/>

    <template v-for="(error, index) in validation?.$errors" :key="index">
      <MoleculeFormError :error="error" :errorMessageParams="errorMessageParams"/>
    </template>
  </div>
</template>

<script>
import AtomInputText from '@/components/atoms/AtomInputText';
import AtomLabel from '@/components/atoms/AtomLabel';
import AtomUnorderedList from '@/components/atoms/AtomUnorderedList';

import MoleculeFormError from '@/components/molecules/MoleculeFormError';

export default {
  props: {
    allowNewItems: { type: Boolean, default: false },
    disabled: {type: Boolean},
    errorMessageParams: {type: Object},
    field: {type: String, required: true,},
    hasErrors: {type: Boolean},
    items: {type: Array, required: true},
    label: {type: String, required: true,},
    modelValue: { type: Object },
    // validation has to be the vuelidate object of the property (i.e. v$.name)
    validation: {type: Object},
  },

  components: {
    AtomInputText,
    AtomLabel,
    AtomUnorderedList,
    MoleculeFormError,
  },

  data() {
    return {
      hoverOnItem: false,
      inputHasFocus: false,
      inputValue: this.modelValue?.label || null,
      selectedItem: this.modelValue || null,

      suggestions: this.items.map(s => {
        return { id: `suggestion-${s.id}`, label: s.label};
      }),
    }
  },

  methods: {
    onBlur() {
      if (!this.hoverOnItem) {
        this.inputHasFocus = false;

        if (!this.selectedItem) {
          this.suggestions = this.items.map(s => {
            return { id: `suggestion-${s.id}`, label: s.label};
          });

          this.inputValue = this.selectedItem ? this.inputValue : null;
        }

        this.$emit('blur')
      }
    },

    onInput(event) {
      this.inputValue = event.target.value;

      this.selectedItem = null;
      this.$emit('update:modelValue', null);

      const input = event.target.value.trim().toLowerCase();

      const filteredSuggestions = input === ''
        ? this.items
        : this.items.filter(i => i.label.toLowerCase().includes(input));

      this.suggestions = filteredSuggestions.length === 0
        ? this.allowNewItems
          ? [ { id: 'suggestion-0', label: '+ Neu hinzufügen' } ]
          : [ { id: 'suggestion--1', label: '(keine Einträge gefunden)' } ]
        : filteredSuggestions.map(s => {
          return { id: `suggestion-${s.id}`, label: s.label }
          });

      // for (let i = 0; i < filteredSuggestions.length; i++) {
      //     const suggestion = filteredSuggestions[i];
      //     const match = suggestion.substring(0, input.length);
      //     filteredSuggestions[i] = suggestion.replace(match, `<strong>${match}</strong>`);
      // }

      //
      //
      //this.$emit('update:modelValue', event.target.value);
    },

    pickItem(event) {
      //event.target.id is always "suggestion-xy", where xy is the id, so I need the substring from index 11
      const id = event.target.id.substring(11);
      this.selectedItem = this.items.find(i => i.id == id);

      if (this.selectedItem) {
        this.inputValue = this.selectedItem.label;
        //TODO - when an item was picked -> should suggestions include ALL items or just the selected one (because it will be the value of the input field)
        this.suggestions = [{ id: `suggestion-${this.selectedItem.id}`, label: this.selectedItem.label }];
        // this.suggestions = this.items.map(s => {
        //   return { id: `suggestion-${s.id}`, label: s.label }
        // });

        this.$emit('itemPicked', event);
      }
      else {
        this.inputValue = null;

        if(id == 0) {
          //add new item
        }
        else if(id == -1) {
          //no items found!
          this.suggestions = this.items.map(i => {
            return { id: `suggestion-${i.id}`, label: i.label }
          });
        }
      }

      this.hoverOnItem = false;
      this.inputHasFocus = false;
    },

    test() {
      console.log('focus!');
    },
  }
};
</script>