<template>
  <div class="dashboard">
    <AtomHeadline tag="h1" text="Dashboard" />

    <OrganismTransactionsDue />
  </div>
</template>
<script>

import AtomHeadline from '@/components/atoms/AtomHeadline';
import OrganismTransactionsDue from '@/components/organisms/OrganismTransactionsDue';

export default {
  components: {
    AtomHeadline,
    OrganismTransactionsDue,
  },
}
</script>