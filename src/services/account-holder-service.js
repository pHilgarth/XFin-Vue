
const baseUrl = "http://localhost:2905/api/accountHolders";

export const AccountHolderService = {
  async getAccountHolders(includeAccounts) {
    let url = baseUrl;

    if (includeAccounts) {
      url += "?includeAccounts=true";
    }

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
