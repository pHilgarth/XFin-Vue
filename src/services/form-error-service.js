const amountErrorMessage =                              'Bitte gib einen gültigen Betrag ein!';
const bicErrorMessage =                                 'Bitte gib einen gültigen BIC ein!';
const ibanErrorMessage =                                'Bitte gib eine gültige IBAN ein!';
const ibanDuplicateErrorMessage =                       'Diese IBAN existiert bereits!';
const nameErrorMessage =                                'Bitte gib einen Namen ein!';

//TODO - change every service name to UpperCase
export const errorService = {
    errorMessages: {
        accountRole:                            'Bitte wähle eine Rolle für dieses Konto aus!',
        amount:                                 amountErrorMessage,
        balance:                                amountErrorMessage,
        bankAccount:                            'Bitte wähle ein Konto aus!',
        bic:                                    bicErrorMessage,
        //costCenter:                             'Diese Kostenstelle passt nicht zum gewählten Transaktions-Typ!',
        costCenter:                             'Bitte wähle eine Kostenstelle aus!',
        //costCenterId:                           'Bitte wähle eine Kostenstelle!',
        counterParty:                           'Bitte gib einen {counterPartyType} an!',
        cycleItem:                              'Bitte wähle einen Turnus!',
        dayOfMonth:                             'Bitte gib eine Zahl zwischen 1 und 28 an!',
        externalParty:                            'Bitte gib einen {externalPartyType} an!',
        externalPartyIban:                        ibanErrorMessage,
        externalPartyBic:                         bicErrorMessage,
        externalPartyIban_ibanDuplicate:          ibanDuplicateErrorMessage,
        freeBudget:                             'Dieser Posten darf nicht negativ sein!',
        iban_ibanValidator:                     ibanErrorMessage,
        iban_ibanDuplicate:                     ibanDuplicateErrorMessage,
        life:                                   'Bitte gib eine Laufzeit an!',
        monthlyInstallment:                     'Bitte gib eine gültige Monatsrate an',
        name_required:                          nameErrorMessage,
        //TODO - make this work ({maxLength}, so I can pass the length dynamically and so it's not hardcoded here)
        //name_maxLength:                         'Der Name darf nicht länger als {maxLength} Zeichen sein!',
        name_maxLength:                         'Der Name darf nicht länger als 25 Zeichen sein!',
        name_nameDuplicate:                     'Dieser Name existiert bereits!',
        payerAccount:                           'Bitte wähle einen Zahlungspflichtigen aus!',
        payerCostCenter:                        'Bitte wähle eine Kostenstelle aus!',
        payeeAccount:                           'Bitte wähle einen Zahlungsempfänger aus!',
        payeeCostCenter:                        'Bitte wähle eine Kostenstelle aus!',
        rateOfInterest:                         'Bitte gib einen gültigen Zinssatz an!',
        reference:                              'Bitte gib einen Verwendungszweck ein!',
        reference_maxLength:                    'Der Verwendungszweck darf nicht länger als 25 Zeichen sein!',
        targetAmount:                           amountErrorMessage,
        title_required:                         'Bitte gib einen Titel ein!',
        title_maxLength:                        'Der Titel darf nicht länger als 30 Zeichen sein!',
        //transactionType:                        'Dieser Transaktions-Typ passt nicht zur gewählten Kostenstelle!',
        transactionType:                        'Bitte wähle einen Transaktionstyp aus!',
        transactionTypeItem:                    'Bitte wähle ein/e Darlehen/Rücklage aus!'
    },

    getErrorMessage(property, validator, params) {
        let errorMessage = this.errorMessages[`${property}_${validator}`] || this.errorMessages[property];

        for (const key in params) {
            errorMessage = errorMessage.replace(`{${key}}`, params[key]);
        }

        //TODO - implement error handling: if the error message contains {...} substrings, but no params were passed to this function, return an empty errorMessage to prevent outputting weird strings

        return errorMessage;
    }
}