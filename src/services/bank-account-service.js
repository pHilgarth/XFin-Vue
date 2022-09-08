//TODO - introduce an 'api-service', which makes all the api calls -> i.e. getALl is always the same, just with different url
const baseUrl = 'http://localhost:2905/api/bankAccounts';

export const bankAccountService = {
  accountActions: [
    {
      id: 'new-revenue',
      label: 'Einnahme eintragen',
    },
    {
      id: 'new-expense',
      label: 'Ausgabe eintragen',
    },
    {
      id: 'budget-manager',
      label: 'Budget verwalten',
    },
    {
      id: 'loan-manager',
      label: 'Darlehen verwalten',
    },
    {
      id: 'fixed-costs-manager',
      label: 'Fixkosten verwalten',
    },
  ],

  async getAll() {
    try {
      return await fetch(baseUrl).then((response) => {
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

  async getSingleById(accountId, year = 0, month = -1) {

    const url = `${baseUrl}/${accountId}?year=${year}&month=${++month}`

    try {
      return await fetch(url).then((response) => {
        if (response.status === 200) {
          return response.json();
        }
        else if (response.status === 404) {
          throw new Error(`no bankAccount found with id ${accountId}!`);
        }
      }).then(data => data);
    } catch (error) {
      throw new Error(error);
    }
  },

  async getSingleByIban(iban) {
    const url = `${baseUrl}/iban/${iban}`

    try {
      return await fetch(url).then((response) => {
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

  async create(bankAccount) {
    const postObject = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(bankAccount)
    };

    try {
      return await fetch(baseUrl, postObject).then((response) => {
        if (response.status === 200) {
          return response.json();
        }
        else if (response.status === 404) {
          throw new Error(`no accountHolder with id ${bankAccount.accountHolderId} found!`);
        }
      }).then(data => data);
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  },

  async update(accountId, jsonPatchDocument) {
    const url = `${baseUrl}/${accountId}`

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
          throw new Error(`no bankAccount found with id ${accountId}!`);
        }
      }).then(data => data);
    } catch (error) {
      throw new Error(error);
    }
  }
}
