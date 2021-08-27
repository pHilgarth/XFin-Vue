//import { AccountHolderService } from '../services/account-holder-service';

const baseUrl = "http://localhost:2905/api/transactionCategories";

export const TransactionCategoryService = {
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

    async getTransactionCategories(id, year, month) {
        const url = `${baseUrl}/${id}?year=${year}&month=${++month}`

        try {
        return await fetch(url).then((response) => {
            if (response.ok) {
            return response.json();
            }
        }).then((data) => {
            if (data != undefined) {
            return data;
            }
        });
        } catch (error) {
        return null;
        }
    },

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