//TODO - dynamische Errormessages einbauen, z. B. amount_availableAmount: Der verfügbare Betrag liegt bei ${availableAmount}!
const amountErrorMessage =                  'Bitte gib einen gültigen Betrag ein!';
const bicErrorMessage =                     'Bitte gib einen gültigen BIC ein!';
const ibanErrorMessage =                    'Bitte gib eine gültige IBAN ein!';
const ibanDuplicateErrorMessage =           'Diese IBAN existiert bereits!';

export const errorMessages = {
    //amount errors
    amount:                                 amountErrorMessage,
    amount_availableAmount:                 'Der Betrag übersteigt das {limitType} auf dieser Kostenstelle!',

    //balance errors
    balance:                                amountErrorMessage,

    //balanceThreshold errors
    balanceThreshold_amount:                amountErrorMessage,
    balanceThreshold_maxAmount:             'Der Betrag darf den aktuellen Kontostand nicht überschreiten! ({balance})',

    //bic errors
    bic:                                    bicErrorMessage,

    //expense errors
    expensesThreshold:                      amountErrorMessage,
    expensesThreshold_minAmount:            'Der Betrag darf die aktuellen Monatsausgaben nicht unterschreiten! ({expensesSum})',

    //freeBudget errors                     //{...} gets replaced by the function getErrorMessage in MoleculeInputText
    //freeBudget:                             'Der Mindestbetrag für dieses Konto beträgt {minimalAmount}!',
    freeBudget:                             'Dieser Posten darf nicht negativ sein!',

    //iban errors
    iban_ibanValidator:                     ibanErrorMessage,
    iban_ibanDuplicate:                     ibanDuplicateErrorMessage,

    //name errors
    name_required:                          'Bitte gib einen Namen ein!',
    name_maxLength:                         'Der Name darf nicht länger als 15 Zeichen sein!',
    name_nameDuplicate:                     'Dieser Name existiert bereits!',

    //counterPart errors
    counterPart_payerRequired:              'Bitte gib einen Zahlungspflichtigen an!',
    counterPart_payeeRequired:              'Bitte gib einen Zahlungsempfänger an!',
    counterPartIban:                        ibanErrorMessage,
    counterPartBic:                         bicErrorMessage,
    counterPartIban_ibanDuplicate:          ibanDuplicateErrorMessage,
}