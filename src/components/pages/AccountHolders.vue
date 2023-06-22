<template>
  Kontoinhaber

  <AtomButton type="light" text="Kontoinhaber hinzufügen" @click.prevent="$router.push('/new-account-holder')" />
</template>

<script>
  import AtomButton from "@/components/atoms/AtomButton";

  export default {
    components: {
      AtomButton,
    }
  }
</script>