//TODO - on every API call service > include the 204-status-code-handling!
//TODO - switch to axios for the api call
//import * as axios from 'axios';

const baseUrl = "http://localhost:2905/api/reserves";

export const ReserveService = {
    async create(reserve) {
        const postObject = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(reserve)
        };

        console.log('im gonna try this');
        try {
            return await fetch(baseUrl, postObject).then((response) => {
                if (response.ok) {
                    console.log('response is ok');
                    return response.json();
                }
                else {
                    console.log('response is not ok');
                }
            }).then((data) => {
                if (data != undefined) {
                    return data;
                }
            });
        } catch (error) {
            console.log(error);
            return error;
        }
    },

    // async getAllByAccountHolder(accountHolderId) {
    //     let url = `${baseUrl}/accountHolder/${accountHolderId}`;
    //
    //     try {
    //         return await fetch(url).then((response) => {
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
    //                     data: data
    //                 };
    //             }
    //             else {
    //                 return {
    //                     success: true,
    //                     error: 'No reserves found!',
    //                     data: null,
    //                 };
    //             }
    //         });
    //     } catch (error) {
    //         return {
    //             success: false,
    //             error: `Error fetching reserves\n${error}`,
    //         };
    //     }
    // },

    async getAll(accountHolderId) {
        try {
            return await fetch(`${baseUrl}/accountHolder/${accountHolderId}`).then((response) => {
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
}