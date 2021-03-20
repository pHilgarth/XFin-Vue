
const baseUrl = "http://localhost:2905/api/bankAccounts";

export const BankAccountService = {
  async getAccount(accountNumber, includeTransactions, year, month) {

    const url = `${baseUrl}/${accountNumber}?includeTransactions=${includeTransactions}&year=${year}&month=${++month}`

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
