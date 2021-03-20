//import { AccountHolderService } from '../services/account-holder-service';

const baseUrl = "http://localhost:2905/api/transactionCategories";

export const CostCenterService = {
    // addExpense(expense) {
    //     const _costCenter = this.costCenters.find(el => el.name === expense.source.costCenter);

    //     _costCenter.expenses.push(expense);
    // },

    // addExternalRevenue(revenue) {
    //     this.costCenters[0].revenues.push(revenue);
    // },

    // addRevenue(revenue) {
    //     const costCenter = this.costCenters.find(el => el.name === revenue.target.costCenter);

    //     costCenter.revenues.push(revenue);
    // },

    // getBudget(accountNumber, costCenter, month) {
    //     let revenuesTotal = 0;

    //     costCenter.revenues.forEach(revenue => {
    //         if (revenue.target.account.accountNumber === accountNumber && revenue.month <= month) {
    //             revenuesTotal += revenue.amount;
    //         }
    //     });

    //     let expensesTotal = 0;

    //     costCenter.expenses.forEach(expense => {
    //         if (expense.source.account.accountNumber === accountNumber && expense.type === 'transfer') {
    //             expensesTotal += expense.amount;
    //         }
    //     });

    //     return revenuesTotal - expensesTotal;
    // },

    // getCostCenterNames() {
    //     let costCenters = [];

    //     for (let i = 1; i < this.costCenters.length; i++) {
    //         const costCenter = this.costCenters[i];

    //         costCenters.push(costCenter.name);
    //     }

    //     return costCenters;
    // },

    async getCostCenters(accountNumber, includeTransactions, year, month) {
        const url = `${baseUrl}/${accountNumber}?includeTransactions=${includeTransactions}&year=${year}&month=${++month}`

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

    // getCostCentersByAccount(accountNumber) {
    //     if (!accountNumber) {
    //         accountNumber = AccountHolderService.depositors[0].accounts[0].accountNumber;
    //     }

    //     // get only the costCenters of the specified account! Only the revenues and expenses of this account and this costCenter
    //     // calculate the balance properly

    //     let costCenters = [];

    //     this.costCenters.forEach(costCenterItem => {
    //         let costCenter = {};

    //         let revenues = costCenterItem.revenues.filter(revenue => revenue.target.account.accountNumber === accountNumber);
    //         let expenses = costCenterItem.expenses.filter(expense => expense.source.account.accountNumber === accountNumber);

    //         let revenuesTotal = 0;
    //         let expensesTotal = 0;

    //         revenues.forEach(revenue => {
    //             revenuesTotal += revenue.amount;
    //         });

    //         expenses.forEach(expense => {
    //             expensesTotal += expense.amount;
    //         })

    //         costCenter.balance = revenuesTotal - expensesTotal;
    //         costCenter.name = costCenterItem.name;

    //         costCenters.push(costCenter);
    //     });

    //     return costCenters;
    // },

    // getExpensesTotal(accountNumber, costCenter, month) {
    //     let expensesTotal = 0;

    //     costCenter.expenses.forEach(expense => {
    //         if (expense.source.account.accountNumber === accountNumber && expense.month === month && expense.type !== 'transfer') {
    //             expensesTotal += expense.amount;
    //         }
    //     });

    //     return expensesTotal;
    // },

    // getProportionPrevMonth(accountNumber, costCenter, month) {
    //     let revenuesTotal = 0;

    //     costCenter.revenues.forEach(revenue => {
    //         if (revenue.target.account.accountNumber === accountNumber && revenue.month < month) {
    //             revenuesTotal += revenue.amount;
    //         }
    //     });

    //     let expensesTotal = 0;

    //     costCenter.expenses.forEach(expense => {
    //         if (expense.source.account.accountNumber === accountNumber && expense.month < month) {
    //             expensesTotal += expense.amount;
    //         } 
    //     });

    //     return revenuesTotal - expensesTotal;
    // },

    // getRevenuesTotal(accountNumber, costCenter, month) {
    //     let revenuesTotal = 0;
        
    //     costCenter.revenues.forEach(revenue => {
    //         if (revenue.target.account.accountNumber === accountNumber && revenue.month === month) {
    //             revenuesTotal += revenue.amount;
    //         }
    //     });

    //     let internalExpensesTotal = 0;

    //     costCenter.expenses.forEach(expense => {

    //         if (expense.source.account.accountNumber === accountNumber && expense.month === month && expense.type === 'transfer') {
    //             internalExpensesTotal += expense.amount;
    //         }
    //     });

    //     return revenuesTotal - internalExpensesTotal;
    // }
}