//TODO - on every API call service > include the 204-status-code-handling!
//TODO - switch to axios for the api call
//import * as axios from 'axios';

const baseUrl = "http://localhost:2905/api/reserves";

export const reserveService = {
    async create(reserve) {
        console.log('abcdef')
        const postObject = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(reserve)
        };


        try {
            return await fetch(baseUrl, postObject).then((response) => {
                if (response.status === 200) {
                    return response.json();
                }
                else if (response.status === 400) {
                    throw new Error(`this error message is stupid and needs to be replaced`);
                }
            }).then(data => data);
        } catch (error) {
            console.error(error);
            throw new Error(error);
        }
    },

    // async getAll() {
    //     return get(baseUrl);
    // },

    async getAllByAccount(accountId) {
        return get(`${baseUrl}/account/${accountId}`);
    },

    async getAllByCostCenter(costCenterId) {
        return get(`${baseUrl}/costCenter/${costCenterId}`);
    },

    async getAllByAccountAndCostCenter(accountId, costCenterId) {
        return get(`${baseUrl}/${accountId}/${costCenterId}`);
    },

    async update(reserveId, jsonPatchDocument) {
        const url = `${baseUrl}/${reserveId}`

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
                    throw new Error(`no reserve found with id ${reserveId}!`);
                }
            }).then(data => data);
        } catch (error) {
            throw new Error(error);
        }
    }
};

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