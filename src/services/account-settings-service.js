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

  async update(settingsId, jsonPatchDocument) {
    const url = `${baseUrl}/${settingsId}`

    const postObject = {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(jsonPatchDocument)
    };

    //TODO - reusable code / duplicated code
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
        error: `Error while updating accountSettings (error: ${error})`,
        updatedRecord: null,
      };
    }
  },
}