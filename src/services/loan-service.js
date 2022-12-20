//TODO - on every API call service > include the 204-status-code-handling!
//TODO - switch to axios for the api call
//import * as axios from 'axios';

const baseUrl = "http://localhost:2905/api/loans";

export const loanService = {
    async create(loan) {
        const postObject = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loan)
        };

        try {
            return await fetch(baseUrl, postObject).then((response) => {
                if (response.status === 200) {
                    return response.json();
                }
                else if (response.status === 204) {
                    return null;
                }
            }).then(data => data);
        } catch (error) {
            console.error(error);
            throw new Error(error);
        }
    },

    async getAllByBankAccount(accountId) {
        try {
            return await fetch(`${baseUrl}/account/${accountId}`).then((response) => {
                if (response.status === 200) {
                    return response.json();
                }
                else if (response.status === 204) {
                    return [];
                }
                else if (response.status === 404) {
                    throw new Error(`no account with id ${accountId} found!`);
                }
            }).then(data => data);
        } catch (error) {
            throw new Error(error);
        }
    },

    async getAllByCreditorAndDebitor(creditorId, debitorId) {
        try {
            return await fetch(`${baseUrl}/${creditorId}/${debitorId}`).then((response) => {
                if (response.status === 200) {
                    return response.json();
                }
                else if (response.status === 204) {
                    return [];
                }
                else if (response.status === 404) {
                    throw new Error(`Error while fetching loans by creditor and debitor!`);
                }
            }).then(data => data);
        } catch (error) {
            throw new Error(error);
        }
    },

    async getSingleById(loanId) {
        try {
            return await fetch(`${baseUrl}/${loanId}`).then((response) => {
                if (response.status === 200) {
                    return response.json();
                }
                else if (response.status === 404) {
                    throw new Error(`no loan with id ${loanId} found!`);
                }
            }).then(data => data);
        } catch (error) {
            throw new Error(error);
        }
    },

    async update(loanId, jsonPatchDocument) {
        const url = `${baseUrl}/${loanId}`

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
                    return response.json();
                }
                else if (response.status === 404) {
                    throw new Error(`no costCenterAsset found with id ${loanId}!`);
                }
            }).then(data => data);
        } catch (error) {
            throw new Error(error);
        }
    }
}