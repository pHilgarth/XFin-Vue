import { NumberService } from '@/services/number-service';

/* amount regex:

    allows a single leading zero
    prevents multiple leading zeros

    allows any number including zeros after a leading 1-9

    allows exavtly 2 decimal places

*/
export const amountValidator =                              (value) => value.match(/^(0|[1-9][0-9]*)?,?[0-9]{1,2}$/);
//export const amountAvailableValidator =     (available) =>  (value) => typeof available === 'number' && typeof value === 'number' ? NumberService.parseFloat(value) <= available : true;
export const amountAvailableValidator =                     (available) => (value) => {
                                                                //returns null or a valid number
                                                                available = NumberService.enforceNumber(available);
                                                                value = NumberService.enforceNumber(value);

                                                                if (available !== null && value !== null) {
                                                                    return value <= available;
                                                                }
                                                                else {
                                                                    return true;
                                                                }
                                                            }

/* balance regex:

    allows negative values

    allows a single leading zero
    prevents multiple leading zeros

    allows any number including zeros after a leading 1-9

    allows exavtly 2 decimal places

*/
export const balanceValidator =                                     (value) => value.match(/^-?(0|[1-9](\.?[0-9]{3})*|[1-9][0-9]{1,2}(\.?[0-9]{3})*),[0-9]{2}$/);
//TODO - balanceThresholdValidator - regex stimmt nicht -> sie matcht auch z.B. 1234.123,32
export const balanceThresholdValidator =                            (value) => value === null || value === undefined || value === '' || value.match(/^-?(0|[1-9](\.?[0-9]{3})*|[1-9][0-9]{1,2}(\.?[0-9]{3})*),[0-9]{2}$/);
//TODO - test this regex - amount is NOT valid, if it matches the regex => what does that mean?
export const balanceThresholdMaxValidator =     (balance) =>        (value) => value === null || value === undefined || value === '' || !value.match(/^-?(0|[1-9](\.?[0-9]{3})*|[1-9][0-9]{1,2}(\.?[0-9]{3})*),[0-9]{2}$/) || NumberService.parseFloat(value) <= balance;
export const bicValidator =                                         (value) => value.match(/^[a-zA-Z]{6}[a-zA-Z0-9]{2}([a-zA-Z0-9]{3})?$/);
export const counterPartValidator =                                 (value) => value !== null && value !== undefined && typeof value === 'string' && value.trim() !== '';
export const expensesThresholdValidator =                           (value) => value === null || value === undefined || value === '' || value.match(/^(0|[1-9][0-9]*),[0-9]{2}$/);
//this validator returns true (=valid) if there is no expenses
export const expensesThresholdMinValidator =    (expensesSum) =>    (value) => value === null || value === undefined || value === '' || !value.match(/^(0|[1-9][0-9]*),[0-9]{2}$/) || NumberService.parseFloat(value) >= expensesSum;
export const ibanDuplicateValidator =           (ibans) =>          (value) => value !== null ? !ibans.includes(value.toUpperCase()) : true;
export const ibanValidator =                                        (value) => value.match(/^[a-zA-Z]{2}[0-9]{20}$/);
export const freeBudgetValidator =                                  (value) => NumberService.parseFloat(value) >= 0;
//TODO - delete, if not needed
//export const freeBudgetValidator =          (minimalAmount) =>  (value) => minimalAmount === null || NumberService.parseFloat(value) >= minimalAmount;
//export const dropDownValidator = (value) => value != -1;