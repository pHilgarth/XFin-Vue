<template>
  <table class="molecule-loan-table">
    <thead>
    <tr>
      <th>Verwendungszweck</th>
      <th>Betrag</th>
      <th>Getilgter Betrag</th>
      <th>Offener Betrag</th>
    </tr>
    </thead>
    <tbody>
    <tr v-for="loan in loans" :key="loan.id">
      <td>
        {{ loan.reference }}
      </td>
      <td></td>
      <td></td>
      <td></td>
    </tr>
    </tbody>
  </table>
</template>

<script>
  export default {
    props: {
      loans: { type: Array, required: true },
    }
  }
</script>