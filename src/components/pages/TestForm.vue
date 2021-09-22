<!-- TODO - delete this component, it is/was just for testing purposes -->
<template>
    <div>
        <h2>{{ `Name in TestForm.vue: ${name}` }}</h2>
        <AtomInputText v-model="name" @blur="v$.name.$touch()" :additionalProps="{ class: `xfin-form__control ${v$.name.$error ? 'has-errors' : ''}` }" />
        <AtomParagraph text="Bitte gib einen Namen an!" :props="{ class: 'xfin-form__error' }" v-if="v$.name.required.$invalid && v$.name.$dirty" />
        <AtomParagraph text="Der Name darf nicht länger als 15 Zeichen sein!" :props="{ class: 'xfin-form__error' }" v-if="v$.name.maxLength.$invalid" />

        <h2>{{ v$.name }}</h2>
        <button @click="touchme">i am the night please touch me</button>
    </div>
</template>

<script>
import AtomInputText from '@/components/atoms/AtomInputText';
import AtomParagraph from "@/components/atoms/AtomParagraph";

import { useVuelidate } from "@vuelidate/core";
import { required, maxLength } from "@vuelidate/validators";

export default {
    components: {
        AtomInputText,
        AtomParagraph,
    },

    data() {
        return {
            name: '',
        };
    },

    setup() {
        return {
            v$: useVuelidate(),
        };
    },
  
    validations() {
        return {
            name: {
                required,
                maxLength: maxLength(15),
            },
        };
    },

    methods: {
        touchme() {
            this.v$.$touch();

            if (this.v$.$errors.length) {
                alert('error');
            }
        }
    }
};
</script>