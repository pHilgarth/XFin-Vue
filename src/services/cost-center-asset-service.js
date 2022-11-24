//import { accountHolderService } from '../services/account-holder-service';

const baseUrl = "http://localhost:2905/api/costCenterAssets";

export const costCenterAssetService = {
    async create(costCenterAsset) {
        const postObject = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(costCenterAsset)
        };

        try {
            return await fetch(baseUrl, postObject).then((response) => {
                if (response.status === 200) {
                    return response.json();
                }
                //TODO - is this the right statuscode to return, when something failed? See also TODO on the API Controller Action
                else if (response.status === 400) {
                    throw new Error(`Error during costCenterAsset creation!`);
                }
            }).then(data => data);
        } catch (error) {
            console.error(error);
            throw new Error(error);
        }
    },

    async getAllByAccountAndCostCenter(accountId, costCenterId) {
        const url = `${baseUrl}/${accountId}/${costCenterId}`;

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

    async update(costCenterAssetId, jsonPatchDocument) {
        const url = `${baseUrl}/${costCenterAssetId}`

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
                    throw new Error(`no costCenterAsset found with id ${costCenterAssetId}!`);
                }
            }).then(data => data);
        } catch (error) {
            throw new Error(error);
        }
    }
}