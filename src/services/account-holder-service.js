//TODO - on every API call service > include the 204-status-code-handling!
//TODO - switch to axios for the api call
//import * as axios from 'axios';

const baseUrl = "http://localhost:2905/api/accountHolders";

export const AccountHolderService = {
  async getAll(includeAccounts) {
    let url = `${baseUrl}?includeAccounts=${includeAccounts}`;

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
            data: data
          };
        }
        else {
          return {
            success: true,
            error: 'No account holders found!',
            data: null,
          };
        }
      });
    } catch (error) {
      return {
        success: false,
        error: `Error fetching account holders\n${error}`,
        data: null,
      };
    }
  },
  async get(id, includeAccounts = false, simpleBankAccounts = true) {
//TODO - test this ternary
    let url = includeAccounts
        ? `${baseUrl}/${id}?includeAccounts=${includeAccounts}&simple=${simpleBankAccounts}`
        : `${baseUrl}/${id}`;

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

  async getByName(name) {
    const url = `${baseUrl}/name/${name}`;

    try {
      return await fetch(url).then((response) => {
        if (response.status === 200) {
          return {
            success: true,
            error: null,
            duplicate: response.json(),
          };
        }
        else if (response.status === 204) {
          return {
            success: true,
            error: null,
            duplicate: null,
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
        error: error,
        duplicate: null,
      };
    }
  },

  async create(accountHolder) {
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
        //TODO - is this the right statuscode to return, when something failed? See also TODO on the API Controller Action
        else if (response.status === 400) {
          return null;
        }
      }).then((data) => {
        if (data !== undefined) {
          return data;
        }
      });
    } catch (error) {
      return error;
    }
  },

//TODO - this api call never returns the actual data - it returns a promise, so it doesnt work the way it should
//TODO - on the get requests i still have the old way which is returning the data, i need to find another way of doing things
  async update(id, jsonPatchDocument) {
    const url = `${baseUrl}/${id}`

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
        error: `Error while updating accountHolder (error: ${error})`,
        updatedRecord: null,
      };
    }
  },
}