<template>
    <div class="form-floating" :class="classList" :id="id">
        <AtomInputText  :id="field" :disabled="disabled" :value="modelValue" :placeholder="label"
                        :classList="`xfin-form__control form-control col-4 ${hasErrors ? 'has-errors' : ''}`"
                        autocomplete="off" @blur="onBlur" @input="onInput" />
                        
        <AtomLabel classList="xfin-form__label" :target="field" :text="`${label}${optional ? '' : ' <i>*</i>'}`" />
        <!-- TODO - hide ul again, if input looses focus (on blur?) -> this is almost done! But if I hover on an element and then press tab, the box wont disappear, thats a cornercase but maybe i can fix it. I would need to track if TAB was pressed i guess-->
        <AtomUnorderedList  classList="xfin__suggestions" v-if="suggestions && suggestions.length > 0" :items="suggestions" @itemClicked="pickItem"
                            @itemMouseenter="hoverOnItem = true" @itemMouseleave="hoverOnItem = false" @tabbedOut="tabbedOut = true" />

        <template v-for="(error, index) in validation?.$errors" :key="index">
            <AtomParagraph classList="xfin-form__error" :text="getErrorMessage(error.$property, error.$validator, errorMessageParams)" />
        </template>
    </div>
</template>

<script>
import AtomInputText from "@/components/atoms/AtomInputText";
import AtomLabel from "@/components/atoms/AtomLabel";
import AtomParagraph from "@/components/atoms/AtomParagraph";
import AtomUnorderedList from '@/components/atoms/AtomUnorderedList';

import { errorMessages } from "@/services/form-error-messages";
export default {
    //TODO - refactor props - i might not need all of them - just copied from MoleculeInputText
    props: {
        id:                 { type: String },
        classList:          { type: String },
        field:              { type: String, required: true, },
        label:              { type: String, required: true, },
        hasErrors:          { type: Boolean },
        modelValue:         { type: String },
        disabled:           { type: Boolean },
        optional:           { type: Boolean },
        // validation has to be the vuelidate object of the property (i.e. v$.name)
        validation:         { type: Object },
        small:              { type: Boolean },
        items:              { type: Array, required: true },
        noItemsFallback:    { type: String },
        alwaysShowFallback: { type: Boolean },
        errorMessageParams: { type: Object },

    },

    components: {
        AtomInputText,
        AtomLabel,
        AtomParagraph,
        AtomUnorderedList,
    },

    data() {
        return {
            hoverOnItem: false,
            suggestions: [],
        }
    },

    methods: {
        onBlur() {
            if (!this.hoverOnItem) {
                this.suggestions = [];
                this.$emit('blur')
            }               
        },

        onInput(event) {
            const input = event.target.value.trim();

            const filteredSuggestions = this.items.filter(i => i.toLowerCase().startsWith(input.toLowerCase()));

            for (let i = 0; i < filteredSuggestions.length; i++) {
                const suggestion = filteredSuggestions[i];
                const match = suggestion.substring(0, input.length);                
                filteredSuggestions[i] = suggestion.replace(match, `<strong>${match}</strong>`);
            }

            if (this.alwaysShowFallback && !this.items.find(i => i.toLowerCase() === input.toLowerCase())) {
                filteredSuggestions.push(this.noItemsFallback);
            }

            this.suggestions = input === ''
                ? []
                : filteredSuggestions.length > 0
                    ? filteredSuggestions
                    : [this.noItemsFallback];
            
            this.$emit('update:modelValue', event.target.value);
        },

      //TODO - make this function reusable in a service
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

        pickItem(event) {
            this.suggestions = [];
            this.$emit('itemPicked', event);
        }
    }
};
</script>