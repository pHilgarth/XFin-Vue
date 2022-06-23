import { required, maxLength } from "@vuelidate/validators";
import {
    amountValidator,
    bicValidator,
    counterPartValidator,
    ibanValidator,
} from "@/validation/custom-validators";


export const accountHolderValidation = {
    name: {
        required, maxLength: maxLength(15),
    },
};

//export const newAccountValidation = {
export const accountValidation = {
    iban:       { ibanValidator },
    bic:        { bicValidator },
    //balance:    { balanceValidator },
};

// export const existingAccountValidation = {
//     iban:       { ibanValidator },
//     bic:        { bicValidator },
// }

export const transactionValidation = {
    amount:                 { amountValidator },
    counterPart:            { counterPartValidator },
    reference:              { required },
};

export const counterPartValidation = {
    counterPartIban:        { ibanValidator },
    counterPartBic:         { bicValidator },
}