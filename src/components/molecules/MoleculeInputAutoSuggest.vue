<template>
  <div :class="`molecule-input-auto-suggest${ small ? ' molecule-input-auto-suggest--small' : ' form-floating'}`">
    <!-- TODO - I removed :placeholder="label" in the AtomInputText - test, if this works everywhere - the placeholder seems to have no function. I have the AtomLabel instead -->
    <AtomInputText :id="field" :disabled="(noItems && !allowNewItems) || disabled" :value="noItems && !allowNewItems ? noItemsLabel : modelValue?.label"
                   :placeholder="label" autocomplete="off"
                   :classList="`xfin__form__form-control form-control molecule-input-auto-suggest__input col-4${hasErrors ? ' has-errors' : ''}`"
                   @blur="onBlur($event)" @input="onInput" @focus="inputHasFocus = true"/>

    <div class="molecule-input-auto-suggest__chevron">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-down" viewBox="0 0 16 16">
        <path fill-rule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/>
      </svg>
    </div>
    <AtomLabel v-if="label" class="xfin__form__label" :for="field" :text="`${label}${ required ? ' <i>*</i>' : ''}`"/>
    <!-- TODO - hide ul again, if input looses focus (on blur?) -> this is almost done! But if I hover on an element and then press tab, the box wont disappear, thats a cornercase but maybe i can fix it. I would need to track if TAB was pressed i guess-->
    <AtomUnorderedList v-if="inputHasFocus" class="molecule-input-auto-suggest__suggestions"
                       :items="suggestions" @itemClicked="pickItem"
                       @itemMouseenter="hoverOnItem = true" @itemMouseleave="hoverOnItem = false" />

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
    items: {type: Array, required: true },
    label: {type: String },
    modelValue: { type: Object },
    noItemsLabel: { type: String, default: 'Keine Einträge vorhanden' },
    required: { type: Boolean, default: false },
    small: { type: Boolean, default: false },
    // validation has to be the vuelidate object of the property (i.e. v$.name)
    validation: {type: Object},
  },

  components: {
    AtomInputText,
    AtomLabel,
    AtomUnorderedList,
    MoleculeFormError,
  },

  computed: {
    noItems() {
      return this.items.length === 0;
    }
  },

  data() {
    return {
      hoverOnItem: false,
      inputHasFocus: false,
      selectedItem: this.modelValue || null,

      suggestions: this.allowNewItems
          ? Array.from([{ id: 'suggestion-0', label: '+ Neu hinzufügen' },
            this.items.map(s => { return { id: `suggestion-${s.id}`, label: s.label};}) ]).flat()
          : this.items.map(s => { return { id: `suggestion-${s.id}`, label: s.label}; }),
    }
  },

  watch: {
    allowNewItems() {
      this.resetSuggestions();
    },

    items() {
      this.resetSuggestions();
    },

    modelValue() {
      if (this.modelValue === null) {
        this.resetSuggestions();
      }
    }
  },

  methods: {
    onBlur(event) {
      //TODO - check if I can empty the field here, instead of doing it with v$....$touch in OrganismTransactionFormNew
      //TODO - because for payeeCostCenter I need to empty the field here onBlur, because there is no validation property, so $touch won't empty it!
      if (!this.hoverOnItem) {
        this.inputHasFocus = false;

        //if (!this.selectedItem) {
        if (!this.modelValue) {
          //TODO - test this, if it works for the required proeprties, which have a validation property, as well
          event.target.value = "";
          this.suggestions = this.items.map(s => {
            return { id: `suggestion-${s.id}`, label: s.label};
          });

          if (this.allowNewItems) {
            this.suggestions.unshift({
              id: 'suggestion-0', label: '+ Neu hinzufügen'
            });
          }

          //TODO - funktioniert das?
          //this.$emit('update:modelValue', null)
        }

        this.$emit('blur', event)
      }
    },

    onInput(event) {
      this.validation?.$reset();
      const input = event.target.value.trim().toLowerCase();

      const filteredSuggestions = input === ''
        ? this.items
        : this.items.filter(i => i.label.toLowerCase().includes(input));

      this.suggestions = filteredSuggestions.map(s => {
          return { id: `suggestion-${s.id}`, label: s.label }
      });

      if (this.allowNewItems) {
        this.suggestions.unshift({ id: 'suggestion-0', label: '+ Neu hinzufügen' });
      }
      else if (this.suggestions.length === 0) {
        this.suggestions.unshift({ id: 'suggestion--1', label: '(keine Einträge gefunden)' });
      }
    },

    pickItem(event) {
      //event.target.id is always "suggestion-xy", where xy is the id, so I need the substring from index 11
      const id = event.target.id.substring(11);
      this.selectedItem = this.items.find(i => i.id == id);

      if (this.selectedItem) {
        //TODO - in OrganismTransactionFormNew hat z.B. payerAccount noch die property "external: <boolean>" --- prüfen, ob das nach dem emit noch der Fall ist!
        this.$emit('update:modelValue', this.selectedItem)

        //TODO - when an item was picked -> should suggestions include ALL items or just the selected one (because it will be the value of the input field)
        //this.suggestions = [{ id: `suggestion-${this.selectedItem.id}`, label: this.selectedItem.label }];
        this.suggestions = this.items.map(s => {
          return { id: `suggestion-${s.id}`, label: s.label }
        });

        if (this.allowNewItems) {
          this.suggestions.unshift({ id: 'suggestion-0', label: '+ Neu hinzufügen' });
        }

        this.$emit('itemPicked', id);
      }
      else {
        if(id == 0) {
          this.$emit('addItem');
        }

      }

      this.hoverOnItem = false;
      this.inputHasFocus = false;
    },

    resetSuggestions() {
      this.suggestions = this.allowNewItems
          ? Array.from([
            { id: 'suggestion-0', label: '+ Neu hinzufügen' },
            this.items.map(s => { return { id: `suggestion-${s.id}`, label: s.label};}) ])
              .flat()
          : this.items.map(s => { return { id: `suggestion-${s.id}`, label: s.label}; });
    }
  }
};
</script>