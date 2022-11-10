import { required, maxLength } from "@vuelidate/validators";
import {
    accountRoleValidator,
    amountValidator,
    bicValidator,
    ibanValidator,
    lifeValidator,
    monthlyInstallmentValidator,
    optionalAmountValidator,
    payerCostCenterValidator,
    rateOfInterestValidator,
} from "@/validation/custom-validators";


export const accountHolderValidation = {
    name: {
        required, maxLength: maxLength(25),
    },
};

export const accountValidation = {
    iban:       { ibanValidator },
    bic:        { bicValidator },
    //balance:    { balanceValidator },
};

export const externalPartyValidation = {
    bic:        { bicValidator },
    iban:       { ibanValidator },
    name:       { required },
};

export const loanValidation = {
    accountRole:            { accountRoleValidator },
    amount:                 { amountValidator },
    counterParty:           { required },
    life:                   { lifeValidator },
    monthlyInstallment:     { monthlyInstallmentValidator },
    rateOfInterest:         { rateOfInterestValidator },
    reference:              { required },
}

export const reserveValidation = {
    bankAccount: { required },
    costCenter: { required },
    title: { required, maxLength: maxLength(30) },
    targetAmount: { optionalAmountValidator }
};

export const transactionValidation = {
    amount:                 { amountValidator },
    payeeAccount:           { required },
    payerAccount:           { required },
    payerCostCenter:        { payerCostCenterValidator: payerCostCenterValidator(null) },
    reference:              { required },
    transactionType:        { required },
    transactionTypeItem:    { required },
};

export const userValidation = {
    userMail:               { required },
    userPassword:           { required },
};