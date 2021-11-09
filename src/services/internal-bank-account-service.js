
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

  async getByIban(iban) {

    const url = `${baseUrl}/iban/${iban}`

    try {
      return await fetch(url).then((response) => {
        if (response.ok) {
          return response.json();
        }
        else if (response.status === 204) {
          alert('204');
          return null;
        }
        //TODO - I'm not sure if this is the right way how to handle connection issues / bad requests etc.
        //TODO - this is not working - if the server is not running, I get an CONNECTION REFUSES but 204 statuscode
        else if (response.status >= 400) {
          alert('400+');
          return {
            success: false,
            error: 'Error during duplicate check',
          };
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
