
const baseUrl = "http://localhost:2905/api/internalBankAccounts";

export const InternalBankAccountService = {
  async getById(id, simple, year = 0, month = 0) {

    const url = `${baseUrl}/${id}?simple=${simple}&year=${year}&month=${++month}`

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

  async getByIban(id, iban) {

    const url = `${baseUrl}/${id}/${iban}`

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
        if (response.ok) {
          return response.json();
        }
        else if (response.status === 409) {
          console.log(409)
          return { duplicate: true };
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
