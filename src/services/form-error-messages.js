//TODO - dynamische Errormessages einbauen, z. B. amount_availableAmount: Der verfügbare Betrag liegt bei ${availableAmount}!
const amountErrorMessage =                  'Bitte gib einen gültigen Betrag ein!';
const bicErrorMessage =                     'Bitte gib einen gültigen BIC ein!';
const ibanErrorMessage =                    'Bitte gib eine gültige IBAN ein!';
const ibanDuplicateErrorMessage =           'Diese IBAN existiert bereits!';
const nameErrorMessage =                    'Bitte gib einen Namen ein!';
const referenceErrorMessage =               'Bitte gib einen Verwendungszweck ein!';

export const errorMessages = {
    //amount errors
    amount:                                 amountErrorMessage,
    amount_availableAmount:                 'Der Betrag übersteigt das {limitType} auf dieser Kostenstelle! (muss das nicht Konto heißen?)',

    //balance errors
    balance:                                amountErrorMessage,

    //balanceThreshold errors
    balanceThreshold_amount:                amountErrorMessage,
    balanceThreshold_maxAmount:             'Der Betrag darf den aktuellen Kontostand nicht überschreiten! ({balance})',

    //bic errors
    bic:                                    bicErrorMessage,



    //counterPart errors
    counterPart_required:                   'Bitte gib einen {counterPartType} an!',
    counterPartIban:                        ibanErrorMessage,
    counterPartBic:                         bicErrorMessage,
    counterPartIban_ibanDuplicate:          ibanDuplicateErrorMessage,

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
    name_required:                          nameErrorMessage,
    name_maxLength:                         'Der Name darf nicht länger als 15 Zeichen sein!',
    name_nameDuplicate:                     'Dieser Name existiert bereits!',

    //reference errors
    reference:                              referenceErrorMessage,
}