<template>
  <table class="molecule-loan-table">
    <thead>
    <tr>
      <th>Verwendungszweck</th>
      <th>Kontotyp</th>
      <th>Kontostand</th>
      <th>Aktion</th>
    </tr>
    </thead>
    <tbody>
    <tr v-for="loan in loans" :key="loan.id">
      <td>
        {{ loan.title }}
      </td>
      <td>{{ bankAccount.description }}</td>
      <td>{{formatCurrency(bankAccount.balance)}}</td>
      <td>
        <MoleculeActionSelect :bankAccount="bankAccount" />
      </td>
    </tr>
    </tbody>
  </table>
</template>

<script>

</script>