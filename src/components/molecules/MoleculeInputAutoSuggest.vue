<template>
    <div class="molecule-input-auto-suggest form-floating">
        <AtomInputText  :id="field" :disabled="disabled" :value="modelValue" :placeholder="label"
                        :classList="`xfin__form__form-control form-control col-4 ${hasErrors ? 'has-errors' : ''}`"
                        autocomplete="off" @blur="onBlur" @input="onInput" />
                        
        <AtomLabel class="xfin__form__label" :for="field" :text="`${label} <i>*</i>`" />
        <!-- TODO - hide ul again, if input looses focus (on blur?) -> this is almost done! But if I hover on an element and then press tab, the box wont disappear, thats a cornercase but maybe i can fix it. I would need to track if TAB was pressed i guess-->
        <AtomUnorderedList  v-if="suggestions && suggestions.length > 0" class="molecule-input-auto-suggest__suggestions" :items="suggestions" @itemClicked="pickItem"
                            @itemMouseenter="hoverOnItem = true" @itemMouseleave="hoverOnItem = false" />

        <template v-for="(error, index) in validation?.$errors" :key="index">
          <MoleculeFormError :error="error" :errorMessageParams="errorMessageParams" />
        </template>
    </div>
</template>

<script>
import AtomInputText from '@/components/atoms/AtomInputText';
import AtomLabel from '@/components/atoms/AtomLabel';
import AtomUnorderedList from '@/components/atoms/AtomUnorderedList';

import MoleculeFormError from '@/components/molecules/shared/MoleculeFormError';

export default {
    props: {
        field:              { type: String, required: true, },
        label:              { type: String, required: true, },
        hasErrors:          { type: Boolean },
        modelValue:         { type: String },
        disabled:           { type: Boolean },
        // validation has to be the vuelidate object of the property (i.e. v$.name)
        validation:         { type: Object },
        items:              { type: Array, required: true },
        noItemsFallback:    { type: String },
        alwaysShowFallback: { type: Boolean },
        errorMessageParams: { type: Object },
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

        pickItem(event) {
            this.suggestions = [];
            this.$emit('itemPicked', event);
        }
    }
};
</script>