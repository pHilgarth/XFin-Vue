//TODO - on every API call service > include the 204-status-code-handling!
//TODO - switch to axios for the api call
//import * as axios from 'axios';

const baseUrl = "http://localhost:2905/api/reserves";

export const ReserveService = {
    async getAllByAccountHolder(accountHolder) {
        let url = `${baseUrl}/accountHolder/${accountHolder.id}`;

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
                        data: data
                    };
                }
                else {
                    return {
                        success: true,
                        error: 'No reserves found!',
                        data: null,
                    };
                }
            });
        } catch (error) {
            return {
                success: false,
                error: `Error fetching reserves\n${error}`,
                data: null,
            };
        }
    },
}