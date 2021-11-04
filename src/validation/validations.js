import { required, maxLength } from "@vuelidate/validators";
import { amountValidator, balanceValidator, bicValidator, ibanValidator, } from "@/validation/custom-validators";


export const accountHolderValidation = {
    name: {
        required, maxLength: maxLength(15),
    },
};

export const newAccountValidation = {
    iban:       { ibanValidator },
    bic:        { bicValidator },
    balance:    { balanceValidator },
};

export const existingAccountValidation = {
    iban:       { ibanValidator },
    bic:        { bicValidator },
}

export const revenueValidation = {
    amount:             { required, amountValidator },
    source:             { required },
    sourceIban:         { ibanValidator },
    sourceBic:          { bicValidator },
}