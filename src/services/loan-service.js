//TODO - on every API call service > include the 204-status-code-handling!
//TODO - switch to axios for the api call
//import * as axios from 'axios';

const baseUrl = "http://localhost:2905/api/loans";

export const LoanService = {
    async getAllByAccount(accountId) {
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
}