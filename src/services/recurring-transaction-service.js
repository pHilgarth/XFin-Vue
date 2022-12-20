
const baseUrl = "http://localhost:2905/api/recurringTransactions";

export const recurringTransactionService = {
  async create(recurringTransaction) {
    const postObject = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(recurringTransaction)
    };

    try {
      return await fetch(baseUrl, postObject).then((response) => {
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

  async getAllByDueDate(dueDate) {
    try {
      return await fetch(`${baseUrl}/${dueDate.getFullYear()}/${dueDate.getMonth() + 1}/${dueDate.getDate()}`).then((response) => {
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

  async getAllBySourceAccount(accountId) {
    try {
      return await fetch(`${baseUrl}/sourceAccount/${accountId}`).then((response) => {
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

  async getAllByTargetAccount(accountId) {
    try {
      return await fetch(`${baseUrl}/targetAccount/${accountId}`).then((response) => {
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

  // async getSingleById(recurringTransactionId) {
  //   try {
  //     return await fetch(`${baseUrl}/${recurringTransactionId}`).then((response) => {
  //       if (response.status === 200) {
  //         return response.json();
  //       }
  //       else if (response.status === 404) {
  //         throw new Error(`no recurringTransaction with id ${recurringTransactionId} found!`);
  //       }
  //     }).then(data => data);
  //   } catch (error) {
  //     throw new Error(error);
  //   }
  // },

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
          throw new Error(`no recurringTransaction with id ${id} found!`)
        }
      }).then(data => data);
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  },
}