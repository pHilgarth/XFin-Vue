//import { AccountHolderService } from '../services/account-holder-service';

const baseUrl = "http://localhost:2905/api/transactionCategories";

export const CostCenterService = {
    async create(costCenter) {
        const postObject = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(costCenter)
        };

        try {
            return await fetch(baseUrl, postObject).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                //TODO - is this the right statuscode to return, when something failed? See also TODO on the API Controller Action
                else if (response.status === 400) {
                    return null;
                }
            }).then((data) => {
                if (data !== undefined) {
                    return data;
                }
            });
        } catch (error) {
            return error;
        }
    },

    async getAll() {
        try {
            return await fetch(baseUrl).then((response) => {
                if (response.status === 200) {
                    return response.json();
                }
                else if (response.status === 204) {
                    return null;
                }
            }).then((data) => {
                if (data != undefined) {
                    return {
                        success: true,
                        error: null,
                        data: data,
                    };
                }
                else {
                    return {
                        success: true,
                        error: 'No categories found',
                        data: null,
                    };
                }
            });
        } catch (error) {
            return {
                success: false,
                error: `Error fetching categories\n${error}`,
            };
        }
    },

    //TODO - do i need this? I need all by account, but all by account simple?
    async getAllSimpleByAccount(id) {
        try {
            return await fetch(`${baseUrl}/simple/${id}`).then((response) => {
                if (response.status === 200) {
                    return response.json();
                }
                else if (response.status === 204) {
                    return null;
                }
            }).then((data) => {
                if (data != undefined) {
                    return {
                        success: true,
                        error: null,
                        data: data,
                    };
                }
                else {
                    return {
                        success: true,
                        error: 'No categories found',
                        data: null,
                    };
                }
            });
        } catch (error) {
            return {
                success: false,
                error: `Error fetching categories\n${error}`,
            };
        }
    },

    async getAllByAccount(id, year, month) {
        const url = `${baseUrl}/${id}?year=${year}&month=${++month}`

        try {
        return await fetch(url).then((response) => {
            if (response.status === 200) {
                return response.json();
            }
            else if (response.status === 204) {
                return null;
            }
        }).then((data) => {
            if (data != undefined) {
                return {
                    success: true,
                    error: null,
                    data: data,
                };
            }
            else {
                return {
                    success: true,
                    error: 'No categories found',
                    data: null,
                };
            }
        });
        } catch (error) {
            return {
                success: false,
                error: `Error fetching categories\n${error}`,
                data: null,
            };
        }
    },

    //TODO - this function is duplicated - it's just copied from account-holder-service.js - I should implement an HttpService or something like that, to remove duplicated code
    //TODO - this api call never returns the actual data - it returns a promise, so it doesnt work the way it should
//TODO - on the get requests i still have the old way which is returning the data, i need to find another way of doing things
    async update(id, jsonPatchDocument) {
        const url = `${baseUrl}/${id}`

        const postObject = {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(jsonPatchDocument)
        };

        try {
            return await fetch(url, postObject).then((response) => {
                if (response.status === 200) {
                    return {
                        success: true,
                        error: null,
                        updatedRecord: response.json(),
                    };
                }
                else if (response.status === 404) {
                    return {
                        success: false,
                        error: 'This record was not found in the database!',
                        updatedRecord: null,
                    };
                }
            }).then((data) => {
                if (data != undefined) {
                    return data;
                }
            });
        } catch (error) {
            return {
                success: false,
                error: `Error while updating costCenter (error: ${error})`,
                updatedRecord: null,
            };
        }
    },

    // addExpense(expense) {
    //     const _transactionCategory = this.transactionCategories.find(el => el.name === expense.source.transactionCategory);

    //     _transactionCategory.expenses.push(expense);
    // },

    // addExternalRevenue(revenue) {
    //     this.transactionCategories[0].revenues.push(revenue);
    // },

    // addRevenue(revenue) {
    //     const transactionCategory = this.transactionCategories.find(el => el.name === revenue.target.transactionCategory);

    //     transactionCategory.revenues.push(revenue);
    // },

    // getBudget(accountNumber, transactionCategory, month) {
    //     let revenuesTotal = 0;

    //     transactionCategory.revenues.forEach(revenue => {
    //         if (revenue.target.account.accountNumber === accountNumber && revenue.month <= month) {
    //             revenuesTotal += revenue.amount;
    //         }
    //     });

    //     let expensesTotal = 0;

    //     transactionCategory.expenses.forEach(expense => {
    //         if (expense.source.account.accountNumber === accountNumber && expense.type === 'transfer') {
    //             expensesTotal += expense.amount;
    //         }
    //     });

    //     return revenuesTotal - expensesTotal;
    // },

    // getTransactionCategoryNames() {
    //     let transactionCategories = [];

    //     for (let i = 1; i < this.transactionCategories.length; i++) {
    //         const transactionCategory = this.transactionCategories[i];

    //         transactionCategories.push(transactionCategory.name);
    //     }

    //     return transactionCategories;
    // },

    // getTransactionCategoriesByAccount(accountNumber) {
    //     if (!accountNumber) {
    //         accountNumber = AccountHolderService.depositors[0].accounts[0].accountNumber;
    //     }

    //     // get only the transactionCategories of the specified account! Only the revenues and expenses of this account and this transactionCategory
    //     // calculate the balance properly

    //     let transactionCategories = [];

    //     this.transactionCategories.forEach(transactionCategoryItem => {
    //         let transactionCategory = {};

    //         let revenues = transactionCategoryItem.revenues.filter(revenue => revenue.target.account.accountNumber === accountNumber);
    //         let expenses = transactionCategoryItem.expenses.filter(expense => expense.source.account.accountNumber === accountNumber);

    //         let revenuesTotal = 0;
    //         let expensesTotal = 0;

    //         revenues.forEach(revenue => {
    //             revenuesTotal += revenue.amount;
    //         });

    //         expenses.forEach(expense => {
    //             expensesTotal += expense.amount;
    //         })

    //         transactionCategory.balance = revenuesTotal - expensesTotal;
    //         transactionCategory.name = transactionCategoryItem.name;

    //         transactionCategories.push(transactionCategory);
    //     });

    //     return transactionCategories;
    // },

    // getExpensesTotal(accountNumber, transactionCategory, month) {
    //     let expensesTotal = 0;

    //     transactionCategory.expenses.forEach(expense => {
    //         if (expense.source.account.accountNumber === accountNumber && expense.month === month && expense.type !== 'transfer') {
    //             expensesTotal += expense.amount;
    //         }
    //     });

    //     return expensesTotal;
    // },

    // getProportionPrevMonth(accountNumber, transactionCategory, month) {
    //     let revenuesTotal = 0;

    //     transactionCategory.revenues.forEach(revenue => {
    //         if (revenue.target.account.accountNumber === accountNumber && revenue.month < month) {
    //             revenuesTotal += revenue.amount;
    //         }
    //     });

    //     let expensesTotal = 0;

    //     transactionCategory.expenses.forEach(expense => {
    //         if (expense.source.account.accountNumber === accountNumber && expense.month < month) {
    //             expensesTotal += expense.amount;
    //         } 
    //     });

    //     return revenuesTotal - expensesTotal;
    // },

    // getRevenuesTotal(accountNumber, transactionCategory, month) {
    //     let revenuesTotal = 0;
        
    //     transactionCategory.revenues.forEach(revenue => {
    //         if (revenue.target.account.accountNumber === accountNumber && revenue.month === month) {
    //             revenuesTotal += revenue.amount;
    //         }
    //     });

    //     let internalExpensesTotal = 0;

    //     transactionCategory.expenses.forEach(expense => {

    //         if (expense.source.account.accountNumber === accountNumber && expense.month === month && expense.type === 'transfer') {
    //             internalExpensesTotal += expense.amount;
    //         }
    //     });

    //     return revenuesTotal - internalExpensesTotal;
    // }
}