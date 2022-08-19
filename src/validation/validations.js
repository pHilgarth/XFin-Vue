import { required, maxLength } from "@vuelidate/validators";
import {
    optionalAmountValidator,
    amountValidator,
    bicValidator,
    externalPartyValidator,
    ibanValidator,
} from "@/validation/custom-validators";


export const accountHolderValidation = {
    name: {
        required, maxLength: maxLength(15),
    },
};

export const accountValidation = {
    iban:       { ibanValidator },
    bic:        { bicValidator },
    //balance:    { balanceValidator },
};

export const counterPartValidation = {
    counterPartIban:        { ibanValidator },
    counterPartBic:         { bicValidator },
};

export const reserveValidation = {
    title: { required, maxLength: maxLength(30) },
    targetAmount: { optionalAmountValidator }
};

export const transactionValidation = {
    amount:                 { amountValidator },
    externalParty:          { externalPartyValidator },
    reference:              { required },
};

export const userValidation = {
    userMail:               { required },
    userPassword:           { required },
};