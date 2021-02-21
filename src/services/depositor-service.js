
export const DepositorService = {
  getDepositors()
  {
    const depositors = [];

    fetch('http://localhost:2905/api/depositors').then((response) =>
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
      for (const depositor of data)
      {
        depositors.push(depositor);
      }
    });

    console.log(depositors);
    return depositors;
  }
};
