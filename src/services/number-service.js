export const numberService = {
    //TODO - is this method doing the same as formatCurrency with includeCurrency = false?
    amountToString(value) {
        return value !== null
            ? Number(value).toFixed(2).replace('.', ',')
            : null;
    },

    enforceNumber(value) {
        let result = typeof value === 'number' && !isNaN(value)
            ? value
            : numberService.parseFloat(value);
        
        return isNaN(result)
            ? null
            : result;
    },

    formatBudget(value) {
        const isNegative = numberService.parseFloat(value) < 0;
        let absValue = isNegative ? value.slice(1) : value;
        //after every input, I format the value
        let formattedValue = absValue.replaceAll(".", "");
        let valueArray = formattedValue.split(',');

        //first I place the thousand separators - I need to reverse it, so I can count up in the loop and set a thousand separator after every third number
        //also I need to copy it, so the length won't change during the loop
        const reversedIntPart = valueArray[0].split('').reverse().join('');
        let triplets = [];
        let triplet = '';

        for (let i = 0; i < reversedIntPart.length; i++) {
            triplet += reversedIntPart.split('')[i];
            if ((i > 1 && (i + 1) % 3 === 0)) {
                triplets.push(triplet);
                triplet = '';
            } else if (i === reversedIntPart.length - 1) {
                triplets.push(triplet);
            }
        }

        valueArray[0] = (`${triplets.join('.')}`).split('').reverse().join('');

        return isNegative ? `-${valueArray.join(',')}` : valueArray.join(',');
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

        //i add a leading zero to day and month and then get the last two chars, only if day or month is below 10 we have leading zeros
        return `${('0' + date.getDate()).slice(-2)}.${('0' + (date.getMonth() + 1)).slice(-2)}.${date.getFullYear()}`
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
    },

    validateBudgetInput(event) {
        //TODO - get rid of these comments

        //TODO - i forgot to handle the delete key press
        //valid input are numbers, comma and backspace
        //event.data is null when backspace was pressed or if something was pasted into the input
        //if something was pasted, it has to be a completely valid amount, thus the regex

        //i have to remove the dots for proper regex checking
        const value = event.target.value.replaceAll('.', '');

        return value.match(/^-?([0-9]*,?[0-9]{0,2}|[0-9]{1,3}\.|[0-9]{1,3}(\.[0-9]{3})+(,[0-9]{0,2})?)$/);

        // return  (event.data === null &&
        //           (event.target.value === "" || event.target.value.match(/^-?([0-9]*,?[0-9]{0,2}|[0-9]{1,3}\.|[0-9]{1,3}(\.[0-9]{3})+(,[0-9]{0,2})?)$/))
        //         )
        //         ||
        //         event.data !== null && event.data.match(/[0-9]+/) || event.data === ',';

        //TODO - move this regex documentation into a doc file
        //these are the teststrings for the long regex above, paste them in regex101.com to see what the reges is doing
        // müssen matchen:
        //   -
        //   -0
        //   -3
        //   -6
        //   ,54
        //   -0,43
        //   0,4
        //   -4,
        //   -00
        //   9
        //   -1239876987698769876987689767676
        //   123
        //   123.
        //   1.
        //   12.
        //   12
        //   -123456,
        //   -123456,5
        //   -123456,67
        //   1.250
        //   1.234,
        //   1.234,6
        //   1.234,67

        //   dürfen nicht matchen:
        //   ..
        //   ,,
        //   --
        //   123..234,34
        //   123,454,54
        //   .234
        //   ,345
        //   1.40,34
        //   123,2.3
        //   123.12323
        //   123.,23
        //   0,456
        //   123.123123,45
        //   1234.234,45
        //   123.2.234444444.
        //   -213456,654
        //   1,234,67
        //   1.234,567
        //   12.345,678
    },
}