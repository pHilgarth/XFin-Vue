
const baseUrl = "http://localhost:2905/api/costCenterAssetTransactions";

export const costCenterAssetTransactionService = {
  async create(transaction) {
    const postObject = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(transaction)
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
}