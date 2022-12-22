<template>
  <div class="dashboard">
    <AtomHeadline tag="h1" text="Dashboard" />

    <OrganismTransactionsDue />
<!--    <MoleculeTransactionsDue />-->

    <h5>NextStep: Kontodetailansicht! -> hier in der API das Model anpassen (BankAccountController.GetSingle())</h5>
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