<template>
    <section>
      <div v-if="loadingError">Fehler beim Laden der Kontoinhaber!</div>
      <div v-else>Daten werden geladen ...</div>
    </section>
</template>

<script>
export default {
  props: {
    loadingError: { required: true },
  }
}
</script>