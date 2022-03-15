<template>
  <div class="xfin__cost-center">
    <p>{{ costCenter.name }}</p>
  </div>
</template>

<script>
  export default {
    props: {
      costCenter: {
        type: Object,
        required: true,
      }
    }
  }
</script>