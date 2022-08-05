
const baseUrl = "http://localhost:2905/api/externalParties";

export const ExternalPartyService = {
  async create(externalParty) {
    const postObject = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(externalParty)
    };

    try {
      return await fetch(baseUrl, postObject).then((response) => {
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
  // async getAll() {
  //   try {
  //     return await fetch(baseUrl).then((response) => {
  //       if (response.ok) {
  //         if (response.status === 204) {
  //           return null;
  //         }
  //         return response.json();
  //       }
  //     }).then((data) => {
  //       if (data != undefined) {
  //         return data;
  //       }
  //     });
  //   } catch (error) {
  //     return null;
  //   }
  // },
}