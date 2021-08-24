export const NumberService = {
    formatCurrency(value) {
        let currencyFormat = new Intl.NumberFormat("de-DE", {
            style: "currency",
            currency: "EUR",
          });
    
          return currencyFormat.format(value);
    },

    formatDate(value) {

        const date = new Date(value);

        //we add a leading zero to day and month and then get the last two chars, only if day or month is below 10 we have leading zeros
        return `${('0' + date.getDate()).slice(-2)}.${'0' + (date.getMonth() + 1)}.${date.getFullYear()}`
    },

    getAccountNumber(iban) {
        return iban.substring(12).replace(/^0+/, "");
    }
}