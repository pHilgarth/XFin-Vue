//TODO - on every API call service > include the 204-status-code-handling!
//TODO - switch to axios for the api call
//import * as axios from 'axios';

const baseUrl = "http://localhost:2905/api/accountHolders";

export const AccountHolderService = {
  async getAllByUser(userId, external = false) {
    try {
      return await fetch(`${baseUrl}/user/${userId}?external=${external}`).then((response) => {
        if (response.status === 200) {
          return response.json();
        }
        else if (response.status === 204) {
          return [];
        }
        else if (response.status === 404) {
          throw new Error(`no user with id ${userId} found!`);
        }
      }).then(data => data);
    } catch (error) {
      throw new Error(error);
    }
  },

  async getSingle(id) {
    let url = `${baseUrl}/${id}`;

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

  async getByName(name) {
    const url = `${baseUrl}/name/${name}`;

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
        if (response.status === 200) {
          return response.json();
        }
        //TODO - is this the right statuscode to return, when something failed? See also TODO on the API Controller Action
        else if (response.status === 404) {
          throw new Error(`no user with id ${accountHolder.userId} found!`);
        }
      }).then(data => data);
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  },

//TODO - this api call never returns the actual data - it returns a promise, so it doesnt work the way it should
//TODO - on the get requests i still have the old way which is returning the data, i need to find another way of doing things
//TODO - test this endpoint again
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
          return response.json();
        }
        else if (response.status === 404) {
          throw new Error()
        }
      }).then(data => data);
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  },
}