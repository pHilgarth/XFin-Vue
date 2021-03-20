const translations = {
    Revenue:            "Einnahme",
    Transfer:           "Umbuchung",
    Expense:            "Ausgabe",
    Initialization:     "Kontoinitialisierung"
}

export const TranslationService = {
    translate(value) {
          return translations[value];
    },
}