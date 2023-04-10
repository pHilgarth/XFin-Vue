const baseUrl = "http://localhost:2905/api";

export const transactionTypeService = {
    transactionTypes: [
        {id: 'Revenue', label: 'Einnahme'},
        {id: 'Expense', label: 'Ausgabe'},
        {id: 'Transfer', label: 'Umbuchung'}
    ],

    async getItems(transactionType, accountId) {
        const endpoint = transactionType === 'repayment'
            ? 'loans'
            : 'reserves';

        const url = `${baseUrl}/${endpoint}/bankAccount/${accountId}`;

        try {
            return await fetch(url).then((response) => {
                if (response.status === 200) {
                    return response.json();
                }
                else if (response.status === 204) {
                    return [];
                }
            }).then(data => data);
        } catch (error) {
            throw new Error(error);
        }
    },

    filterAccounts(transactionType, bankAccounts) {
        const accounts = {};
        switch (transactionType) {
            case "Revenue":
                accounts.payerAccounts = bankAccounts.filter(b => b.external);
                accounts.payeeAccounts = bankAccounts.filter(b => !b.external);
                break;
            case "Expense":
                accounts.payerAccounts = bankAccounts.filter(b => !b.external);
                accounts.payeeAccounts = bankAccounts.filter(b => b.external);
                break;
            case "Transfer":
                accounts.payerAccounts = bankAccounts.filter(b => !b.external);
                accounts.payeeAccounts = bankAccounts.filter(b => !b.external);
        }

        for (let prop in accounts) {
            accounts[prop] = accounts[prop].map(a => {
                return { id: a.id, label: `${a.accountHolderName} (${a.iban})`, external: a.external }
            });
        }

        return accounts;

        // return transactionType === 'Revenue'
        //     ?
        //         {
        //             payerAccounts: bankAccounts
        //                 .filter(b => b.external)
        //                 .map(p => {
        //                     return {id: p.id, label: `${p.accountHolderName} (${p.iban})`, external: p.external}
        //                 }),
        //             payeeAccounts: bankAccounts
        //                 .filter(b => !b.external)
        //                 .map(p => {
        //                     return {id: p.id, label: `${p.accountHolderName} (${p.iban})`, external: p.external}
        //                 })
        //         }
        //     : transactionType === 'Expense'
        //         ?
        //             {
        //                 payerAccounts: bankAccounts
        //                     .filter(b => !b.external)
        //                     .map(p => {
        //                         return {id: p.id, label: `${p.accountHolderName} (${p.iban})`, external: p.external}
        //                     }),
        //                 payeeAccounts: bankAccounts
        //                     .filter(b => b.external)
        //                     .map(p => {
        //                         return {id: p.id, label: `${p.accountHolderName} (${p.iban})`, external: p.external}
        //                     })
        //             }
        //         :
        //             {
        //                 payerAccounts: bankAccounts
        //                     .filter(b => !b.external)
        //                     .map(p => {
        //                         return {id: p.id, label: `${p.accountHolderName} (${p.iban})`, external: p.external}
        //                     }),
        //                 payeeAccounts: bankAccounts
        //                     .filter(b => !b.external)
        //                     .map(p => {
        //                         return {id: p.id, label: `${p.accountHolderName} (${p.iban})`, external: p.external}
        //                     }),
        //             }
        // ;

        // if (transactionType === 'Revenue') {
        //     this.payerAccounts = this.bankAccounts
        //         .filter(b => b.external)
        //         .map(p => {
        //             return {id: p.id, label: `${p.accountHolderName} (${p.iban})`, external: p.external}
        //         });
        //
        //     this.payeeAccounts = this.bankAccounts
        //         .filter(b => !b.external)
        //         .map(p => {
        //             return {id: p.id, label: `${p.accountHolderName} (${p.iban})`, external: p.external}
        //         });
        // } else if (transactionType === 'Expense') {
        //     this.payerAccounts = this.bankAccounts
        //         .filter(b => !b.external)
        //         .map(p => {
        //             return {id: p.id, label: `${p.accountHolderName} (${p.iban})`, external: p.external}
        //         });
        //
        //     this.payeeAccounts = this.bankAccounts
        //         .filter(b => b.external)
        //         .map(p => {
        //             return {id: p.id, label: `${p.accountHolderName} (${p.iban})`, external: p.external}
        //         });
        // } else if (transactionType === 'Transfer') {
        //     this.payerAccounts = this.bankAccounts
        //         .filter(b => !b.external)
        //         .map(p => {
        //             return {id: p.id, label: `${p.accountHolderName} (${p.iban})`, external: p.external}
        //         });
        //
        //     this.payeeAccounts = this.bankAccounts
        //         .filter(b => !b.external)
        //         .map(p => {
        //             return {id: p.id, label: `${p.accountHolderName} (${p.iban})`, external: p.external}
        //         });
        // }
    }
}