export const NumberService = {
    //TODO - is this method doing the same as formatCurrency with includeCurrency = false?
    amountToString(value) {
        return value !== null
            ? Number(value).toFixed(2).replace('.', ',')
            : null;
    },

    formatCurrency(value, includeCurrency = true) {
        let currencyFormat = new Intl.NumberFormat("de-DE", {
            style: "currency",
            currency: "EUR",
          });    
          return value !== null
              ? includeCurrency
                  ? currencyFormat.format(value)
                  : currencyFormat.format(value).slice(0, -2)
              : null;
    },

    formatDate(value) {

        if (!value) {
            return null;
        }

        const date = new Date(value);

        //we add a leading zero to day and month and then get the last two chars, only if day or month is below 10 we have leading zeros
        return `${('0' + date.getDate()).slice(-2)}.${'0' + (date.getMonth() + 1)}.${date.getFullYear()}`
    },

    getAccountNumber(iban) {
        return iban !== null
            ? iban.substring(12).replace(/^0+/, "")
            : null;
    },

    parseFloat(value) {
        return value !== null && value !== undefined
            ? parseFloat(value.replaceAll(".", "").replace(",", "."))
            : null;
    }
}