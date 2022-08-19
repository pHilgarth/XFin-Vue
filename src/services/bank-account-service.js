//TODO - introduce an 'api-service', which makes all the api calls -> i.e. getALl is always the same, just with different url
const baseUrl = "http://localhost:2905/api/bankAccounts";

export const BankAccountService = {
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

  async getById(id, simple, year = 0, month = -1) {

    const url = `${baseUrl}/${id}?simple=${simple}&year=${year}&month=${++month}`

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
            data: data,
          };
        }
      });
    } catch (error) {
      return {
        success: null,
        error: `Error fetching categories\n${error}`,
        data: null,
      };
    }
  },

  async getByIban(iban) {
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

  async update(accountNumber, jsonPatchDocument) {
    const url = `${baseUrl}/${accountNumber}`

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
          return {
            success: true,
            error: null,
            updatedRecord: response.json(),
          };
        }
        else if (response.status === 404) {
          return {
            success: false,
            error: 'This record was not found in the database!',
            updatedRecord: null,
          };
        }
      }).then((data) => {
        if (data != undefined) {
          return data;
        }
      });
    } catch (error) {
      return {
        success: false,
        error: `Error while updating bankAccount (error: ${error})`,
        updatedRecord: null,
      };
    }
  }
}
