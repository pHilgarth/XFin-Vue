<template>
  <pre>{{ bankAccount }}</pre>
</template>

<script>
  export default {
    props: {
      bankAccount: { type: Object, required: true },
    },
  };
</script>