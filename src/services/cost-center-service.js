//import { accountHolderService } from '../services/account-holder-service';

const baseUrl = "http://localhost:2905/api/costCenters";

export const costCenterService = {
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
                if (response.status === 200) {
                    return response.json();
                }
                //TODO - is this the right statuscode to return, when something failed? See also TODO on the API Controller Action
                else if (response.status === 400) {
                    throw new Error(`Error during costCenter creation!`);
                }
            }).then(data => data);
        } catch (error) {
            console.error(error);
            throw new Error(error);
        }
    },

    async getAllByUser(userId) {
        try {
            return await fetch(`${baseUrl}/user/${userId}`).then((response) => {
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

    //TODO - do i need this? I need all by account, but all by account simple?
    // async getAllSimpleByAccount(id) {
    //     try {
    //         return await fetch(`${baseUrl}/simple/${id}`).then((response) => {
    //             if (response.status === 200) {
    //                 return response.json();
    //             }
    //             else if (response.status === 204) {
    //                 return null;
    //             }
    //         }).then((data) => {
    //             if (data != undefined) {
    //                 return {
    //                     success: true,
    //                     error: null,
    //                     data: data,
    //                 };
    //             }
    //             else {
    //                 return {
    //                     success: true,
    //                     error: 'No categories found',
    //                     data: null,
    //                 };
    //             }
    //         });
    //     } catch (error) {
    //         return {
    //             success: false,
    //             error: `Error fetching categories\n${error}`,
    //         };
    //     }
    // },

    async getAllByUserAndAccount(userId, accountId, year, month) {
        const url = `${baseUrl}/user/${userId}/account/${accountId}?year=${year}&month=${++month}`

        try {
            return await fetch(url).then((response) => {
                if (response.status === 200) {
                    return response.json();
                }
                else if (response.status === 404) {
                    throw new Error(`no account found with id ${accountId}!`);
                }
            }).then(data => data);
        } catch (error) {
            throw new Error(error);
        }
    },

    async getSingleByUserAndName(userId, name) {
        try {
            return await fetch(`${baseUrl}/user/${userId}/name/${name}`).then((response) => {
                if (response.status === 200) {
                    return response.json();
                }
                else if (response.status === 404) {
                    return null;
                }
            }).then(data => data);
        } catch (error) {
            throw new Error(error);
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
}