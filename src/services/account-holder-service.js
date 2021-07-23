
const baseUrl = "http://localhost:2905/api/accountHolders";

export const AccountHolderService = {
  async getAccountHolders(includeAccounts) {
    let url = `${baseUrl}?includeAccounts=${includeAccounts}`;

    try {
      return await fetch(url).then((response) => {
        if (response.ok) {
          return response.json();
        }
      }).then((data) => {
        if (data != undefined) {
          return data;
        }
      });
    } catch (error) {
      return null;
    }
  },

  async getAccountHolder(id, includeAccounts) {
    let url = `${baseUrl}/${id}?includeAccounts=${includeAccounts}`;

    try {
      return await fetch(url).then((response) => {
        if (response.ok) {
          return response.json();
        }
      }).then((data) => {
        if (data != undefined) {
          return data;
        }
      });
    } catch (error) {
      return null;
    }
  },

  async createAccountHolder(accountHolder) {
    const postObject = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(accountHolder)
    };

    try {
      return await fetch(baseUrl, postObject).then((response) => {
        if (response.ok) {
          return response.json();
        }
      }).then((data) => {
        if (data != undefined) {
          return data;
        }
      });
    } catch (error) {
      return null;
    }
  }
}