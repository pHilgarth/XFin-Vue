<template>
    <section class="molecule-loading">
      <div v-if="loadingError">{{ errorMessage }}</div>
      <div v-else>Daten werden geladen ...</div>
    </section>
</template>

<script>
export default {
  props: {
    errorMessage: { type: String, required: true },
    loadingError: { type: Boolean, required: true },
  }
}
</script>