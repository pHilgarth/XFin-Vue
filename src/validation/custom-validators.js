import { numberService } from '@/services/number-service';
import { helpers } from '@vuelidate/validators';

/* amount regex:

    allows a single leading zero
    prevents multiple leading zeros

    allows any number including zeros after a leading 1-9

    allows exavtly 2 decimal places

*/
export const amountValidator =                              (value) => value.match(/^(0|[1-9][0-9]*)?,?[0-9]{1,2}$/);

/* balance regex:

    allows negative values

    allows a single leading zero
    prevents multiple leading zeros

    allows any number including zeros after a leading 1-9

    allows exavtly 2 decimal places

*/
export const balanceValidator =                                     (value) => value.match(/^-?(0|[1-9](\.?[0-9]{3})*|[1-9][0-9]{1,2}(\.?[0-9]{3})*),[0-9]{2}$/);
export const bicValidator =                                         (value) => value.match(/^[a-zA-Z]{6}[a-zA-Z0-9]{2}([a-zA-Z0-9]{3})?$/);
export const counterPartValidator =                                 (value) => value !== null && value !== undefined && typeof value === 'string' && value.trim() !== '';
export const ibanDuplicateValidator = (ibans) => helpers.withParams(
    { ibans: ibans },
    (value) => { return value !== null ? !ibans.includes(value.toUpperCase()) : true;},
);
export const ibanValidator =                                        (value) => value.match(/^[a-zA-Z]{2}[0-9]{20}$/);
export const freeBudgetValidator =                                  (value) => numberService.parseFloat(value) >= 0;
//TODO - delete, if not needed
//export const freeBudgetValidator =          (minimalAmount) =>  (value) => minimalAmount === null || numberService.parseFloat(value) >= minimalAmount;

export const costCenterValidator = (transactionRole) => helpers.withParams(
    { transactionRole },
    (value) => {
        console.log(transactionRole);
        console.log(value);
        return (value !== '- Kostenstelle wählen -' && value !== '' && value !== null) && (transactionRole !== 'loan' || value !== 'Nicht zugewiesen');
    },
);




export const firstSelectValidator = (secondSelect) => helpers.withParams(
    { secondSelect: secondSelect },
    (value) => {
        console.log(`validating firstSelect - secondSelect is: ${secondSelect + ' (' + typeof(secondSelect) + ')' || '(its null or empty)'}`);

        if (secondSelect === '1') {
            return value === 'A';
        }
        else if (secondSelect === '2') {
            return value === 'B';
        }
        else if (secondSelect === '3') {
            return value === 'C';
        }
        else {
            return true;
        }
    }
);

export const secondSelectValidator = (firstSelect) => (value) => {
    console.log(`validating secondSelect - firstSelect is: ${firstSelect || '(its null or empty)'}`);

    if (value === '') {
        return false;
        //console.log('value is empty string');
    }
    else {
        return true;
    }
    //return value !== 'C' && value !== '';
}