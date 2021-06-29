
const baseUrl = "http://localhost:2905/api/accountHolders";

export const AccountHolderService = {
  async getAccountHolders(includeAccounts) {
    let url = `${baseUrl}?includeAccounts=${includeAccounts}`;console.log(url);

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
  }
}
