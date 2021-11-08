//TODO - on every API call service > include the 204-status-code-handling!
//TODO - switch to axios for the api call
//import * as axios from 'axios';
// TODO - this service is not finished/tested yet
const baseUrl = "http://localhost:2905/api/internalBankAccountSettings";

export const AccountSettingsService = {
  async get(id) {
    let url = `${baseUrl}/${id}`;

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

  async create() {
    console.error('AccountSettingsService.create is not implemented');
  },

  async update() {
    console.error('AccountSettingsService.update is not implemented');
  },
}