//TODO - switch to axios for the api call
//import * as axios from 'axios';

const baseUrl = "http://localhost:2905/api/accountHolders";

export const AccountHolderService = {
  async getAll(includeAccounts) {
    let url = `${baseUrl}?includeAccounts=${includeAccounts}`;

    try {
      return await fetch(url).then((response) => {
        if (response.ok) {
          if (response.status === 204) {
            return [];
          }
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

  async get(id, includeAccounts, simpleBankAccounts) {
    let url = `${baseUrl}/${id}?includeAccounts=${includeAccounts}&simple=${simpleBankAccounts}`;

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
        else if (response.status === 409) {
          return { duplicate: true };
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

  async update(accountHolder) {
    const url = `${baseUrl}/${accountHolder.id}`
    const postObject = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(accountHolder)
    };

    try {
      return await fetch(url, postObject).then((response) => {
        if (response.ok) {
          return response.json();
        }
        else if (response.status === 409) {
          return { duplicate: true };
        }
      }).then((data) => {
        if (data != undefined) {
          return data;
        }
      });
    } catch (error) {
      return error;
    }
  }
}