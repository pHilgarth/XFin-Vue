//import { AccountHolderService } from '../services/account-holder-service';

const baseUrl = "http://localhost:2905/api/costCenterAssets";

export const CostCenterAssetService = {
    async getAllByCostCenter(costCenterId) {
        const url = `${baseUrl}/${costCenterId}`;

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
}