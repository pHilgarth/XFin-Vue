
/* amount regex:

    allows a single leading zero
    prevents multiple leading zeros

    allows any number including zeros after a leading 1-9

    allows exavtly 2 decimal places

*/
export const amountValidator =                      (value) => value.match(/^(0|[1-9][0-9]*),[0-9]{2}$/);
/* balance regex:

    allows negative values

    allows a single leading zero
    prevents multiple leading zeros

    allows any number including zeros after a leading 1-9

    allows exavtly 2 decimal places

*/
export const balanceValidator =                     (value) => value.match(/^-?(0|[1-9](\.?[0-9]{3})*|[1-9][0-9]{1,2}(\.?[0-9]{3})*),[0-9]{2}$/);
export const bicValidator =                         (value) => value.match(/^[a-zA-Z]{6}[a-zA-Z0-9]{2}([a-zA-Z0-9]{3})?$/);
export const counterPartValidator =                 (value) => value !== null && value !== undefined && typeof value === 'string' && value.trim() !== '';
//TODO - iban duplicator - compare lowercase!
export const ibanDuplicateValidator =   (ibans) =>  (value) => value !== null ? !ibans.includes(value.toUpperCase()) : true;
export const ibanValidator =                        (value) => value.match(/^[a-zA-Z]{2}[0-9]{20}$/);
//TODO - delete, if not needed
//export const dropDownValidator = (value) => value != -1;