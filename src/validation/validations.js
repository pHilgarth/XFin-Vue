import { required, maxLength } from "@vuelidate/validators";
import { bicValidator, ibanValidator, balanceValidator } from "@/validation/custom-validators";


export const accountHolderValidation = {
    name: {
        required,
        maxLength: maxLength(15),
    },
};

export const accountValidation = {
    iban:       { ibanValidator },
    bic:        { bicValidator },
    balance:    { balanceValidator },
}