import { required, maxLength } from "@vuelidate/validators";
import { bicValidator, ibanValidator, balanceValidator, dropDownValidator } from "@/validation/custom-validators";

export const accountHolderValidation = {
    name: {
        required,
        maxLength: maxLength(15),
    },
    iban: { ibanValidator },
    bic: { bicValidator },
    balance: { balanceValidator },
    selectedAccountIndex: { dropDownValidator },
}