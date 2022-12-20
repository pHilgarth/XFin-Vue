<template>
  <div class="dashboard">
    <AtomHeadline tag="h1" text="Dashboard" />

    <OrganismTransactionsDue />
<!--    <MoleculeTransactionsDue />-->

    <h3>NextSteps: <ul><li>Verknüpfung von Transaktionen zu Rücklagen testen (wiederkehrend / Sparraten)</li><li>Kontodetailansicht!</li></ul></h3>
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