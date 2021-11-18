<template>
    <input type="text" class="text-right" :value="valueProp" @input="$emit('amount-changed', $event)" />
</template>

<script>
//import { NumberService } from '@/services/number-service';

export default {
    emits: [ 'amount-changed' ],

    props: {
        valueProp: {
            type: String,
            required: true,
        },
    },

    computed: {
        value() {
            return this.valueProp;
        }
    },

    methods: {
        processInput(event) {console.log(event)
            // const caretPosition = event.target.selectionStart;
            // const lengthBefore = event.target.value.length;
            //
            // if (this.validateInput(event)) {
            //     const negative = NumberService.parseFloat(event.target.value) < 0;
            //     let value = negative ? event.target.value.slice(1) : event.target.value;
            //
            //     //TODO - move this formatting code into a service (this code formats the value and places the thounsand separators appropriatly
            //     //after every input, we format the value
            //     let formattedValue = value.replaceAll(".", "");
            //     let valueArray = formattedValue.split(',');
            //
            //     if (valueArray.length === 2) {
            //         valueArray[1] = valueArray[1].length > 2 ? valueArray[1].slice(0, 2) : valueArray[1];
            //     }
            //
            //     //first we place the thousand separators - we need to reverse it, so we can count up in the loop and set a thousand separator after every third number
            //     //also we need to copy it, so the length won't change during the loop
            //     const reversedIntPart = valueArray[0].split('').reverse().join('');
            //     let triplets = [];
            //     let triplet = '';
            //
            //     for (let i = 0; i < reversedIntPart.length; i++) {
            //         triplet += reversedIntPart.split('')[i];
            //         if ((i > 1 && (i + 1) % 3 === 0)) {
            //             triplets.push(triplet);triplet='';
            //         }
            //         else if (i === reversedIntPart.length - 1) {
            //             triplets.push(triplet);
            //         }
            //     }
            //
            //     valueArray[0] = (`${triplets.join('.')}`).split('').reverse().join('');
            //
            //     formattedValue = negative ? `-${valueArray.join(',')}` : valueArray.join(',');
            //
            //     const lengthAfter = formattedValue.length;
            //
            //     event.target.value = formattedValue;
            //
            //     event.target.selectionStart = caretPosition + (lengthAfter - lengthBefore);
            //     event.target.selectionEnd = caretPosition + (lengthAfter - lengthBefore);
            //
            //     this.$emit('amount-changed', { value: event.target.value });
            // }
            // else {
            //     event.target.value = this.value;
            //     event.target.selectionStart = caretPosition - 1;
            //     event.target.selectionEnd = caretPosition - 1;
            // }
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
    },
}
</script>