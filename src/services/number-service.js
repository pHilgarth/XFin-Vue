
export const NumberService = {
    formatCurrency(value) {
        let currencyFormat = new Intl.NumberFormat("de-DE", {
            style: "currency",
            currency: "EUR",
          });
    
          return currencyFormat.format(value);
    }
}
