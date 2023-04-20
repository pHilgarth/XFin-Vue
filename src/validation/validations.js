import { required, maxLength } from "@vuelidate/validators";
import {
    //accountRoleValidator,
    amountValidator,
    balanceValidator,
    bicValidator,
    dayOfMonthValidator,
    ibanValidator,
    lifeValidator,
    //monthlyInstallmentValidator,
    optionalAmountValidator,
    optionalBicValidator,
    optionalIbanValidator,
    //payerCostCenterValidator,
    //rateOfInterestValidator,
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

export const costCenterAssetValidation = {
    updatedCostCenterAssetName:     { required },
    updatedCostCenterAssetAmount:   { balanceValidator },
    newCostCenterAssetName:         { required },
};

export const externalPartyValidation = {
    bic:        { optionalBicValidator },
    iban:       { optionalIbanValidator },
    name:       { required },
};

export const loanValidation = {
    amount:                 { amountValidator },
    creditorAccount:        { required },
    debitorAccount:         { required },
    life:                   { lifeValidator },
    monthlyInstallment:     { optionalAmountValidator },
    rateOfInterest:         { optionalAmountValidator },
    reference:              { required },
};

export const recurringTransactionValidation = {
    amount:                 { amountValidator },
    dayOfMonth:             { dayOfMonthValidator },
    cycleItem:              { required },
    endDate:                { required },
    reference:              { required },
    startDate:              { required },
};

export const reserveValidation = {
    bankAccount:    { required },
    costCenter:     { required },
    reference:      { required, maxLength: maxLength(100) },
    targetAmount:   { optionalAmountValidator }
};

export const reserveEditValidation = {
    reference:      { required, maxLength: maxLength(30) },
    targetAmount:   { optionalAmountValidator },
}

export const transactionValidation = {
    amount:                 { amountValidator },
    // payeeAccount:           { required },
    // payerAccount:           { required },
    //payerCostCenter:        { payerCostCenterValidator: payerCostCenterValidator(null) },
    reference:              { required, maxLength: maxLength(100) },
    //transactionType:        { required },
};

export const userValidation = {
    userMail:               { required },
    userPassword:           { required },
};