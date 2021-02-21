
export const DepositorService = {
  getDepositors(includeAccounts = false)
  {
    return fetch('http://localhost:2905/api/depositors?includeAccounts=true').then((response) =>
      {
        if (response.ok)
        {
          return response.json();
        }
        else
        {
          return "NOTHING HERE";
        }
      }).then((data) =>
      {
        const depositors = [];

        for (const depositorId in data)
        {
          const bankAccounts = [];

          if (includeAccounts) {
            for (const bankAccountId in data[depositorId].bankAccounts) {
              bankAccounts.push(
              {
                id:               data[depositorId].bankAccounts[bankAccountId].id,
                depositorId:      data[depositorId].bankAccounts[bankAccountId].depositorId,
                balance:          data[depositorId].bankAccounts[bankAccountId].balance,
                accountNumber:    data[depositorId].bankAccounts[bankAccountId].accountNumber,
                iban:             data[depositorId].bankAccounts[bankAccountId].iban,
                bic:              data[depositorId].bankAccounts[bankAccountId].bic,
                bank:             data[depositorId].bankAccounts[bankAccountId].bank,
                accountType:      data[depositorId].bankAccounts[bankAccountId].accountType
              });
            }
          }
        
          depositors.push(
          {
            id:             data[depositorId].id,
            name:           data[depositorId].name,
            bankAccounts:   bankAccounts
          });
        }
        
        return depositors;
      });
  }
};
