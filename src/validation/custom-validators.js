import { NumberService } from '@/services/number-service';

/* amount regex:

    allows a single leading zero
    prevents multiple leading zeros

    allows any number including zeros after a leading 1-9

    allows exavtly 2 decimal places

*/
export const amountValidator =                              (value) => value.match(/^(0|[1-9][0-9]*),[0-9]{2}$/);
export const amountAvailableValidator =     (available) =>  (value) => NumberService.parseFloat(value) <= available;
/* balance regex:

    allows negative values

    allows a single leading zero
    prevents multiple leading zeros

    allows any number including zeros after a leading 1-9

    allows exavtly 2 decimal places

*/
export const balanceValidator =                                 (value) => value.match(/^-?(0|[1-9](\.?[0-9]{3})*|[1-9][0-9]{1,2}(\.?[0-9]{3})*),[0-9]{2}$/);
export const balanceThresholdValidator =                        (value) => value === null || value === undefined || value === '' || value.match(/^-?(0|[1-9](\.?[0-9]{3})*|[1-9][0-9]{1,2}(\.?[0-9]{3})*),[0-9]{2}$/);
export const balanceThresholdMaxValidator = (balance) =>        (value) => value === null || value === undefined || value === '' || !value.match(/^-?(0|[1-9](\.?[0-9]{3})*|[1-9][0-9]{1,2}(\.?[0-9]{3})*),[0-9]{2}$/) || NumberService.parseFloat(value) <= balance;
export const bicValidator =                                     (value) => value.match(/^[a-zA-Z]{6}[a-zA-Z0-9]{2}([a-zA-Z0-9]{3})?$/);
export const counterPartValidator =                             (value) => value !== null && value !== undefined && typeof value === 'string' && value.trim() !== '';
export const expensesThresholdValidator =                       (value) =>  value === null || value === undefined || value === '' || value.match(/^(0|[1-9][0-9]*),[0-9]{2}$/);
export const ibanDuplicateValidator =       (ibans) =>          (value) => value !== null ? !ibans.includes(value.toUpperCase()) : true;
export const ibanValidator =                                    (value) => value.match(/^[a-zA-Z]{2}[0-9]{20}$/);
export const freeBudgetValidator =          (minimalAmount) =>  (value) => minimalAmount === null || NumberService.parseFloat(value) >= minimalAmount;
//TODO - delete, if not needed
//export const dropDownValidator = (value) => value != -1;