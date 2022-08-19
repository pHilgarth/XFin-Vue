<template>
  <div class="new-expense">
    <AtomHeadline tag="h1" text="Ausgabe eintragen" />
  </div>
  <OrganismTransaction class="new-expense" transactionType="expense" />
</template>

<script>
  import AtomHeadline from '@/components/atoms/AtomHeadline';
  import OrganismTransaction from '@/components/organisms/OrganismTransaction';

  export default {
    components: {
      AtomHeadline,
      OrganismTransaction,
    },
  };
</script>