//TODO - on every API call service > include the 204-status-code-handling!
//TODO - switch to axios for the api call
//import * as axios from 'axios';

const baseUrl = "http://localhost:2905/api/recurringTransactions";

export const overheadsService = {
    async getAllBySourceAccount(accountId) {
        return get(`${baseUrl}/sourceAccount/${accountId}`);
    },

    async getAllByTargetAccount(accountId) {
        return get(`${baseUrl}/targetAccount/${accountId}`);
    },
};

//TODO - use this on every service (outsourced get functions and post ... etc.)
const get = async function(url) {
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
}