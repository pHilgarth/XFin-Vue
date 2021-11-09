<template>
  <div class="new-account-holder">
    <OrganismAccountHolder @save="saveAccountHolder" />
    <!-- TODO - implement MoleculeLoading on every component, where an API call is made -->
  </div>
</template>

<script>
import OrganismAccountHolder from "@/components/organisms/OrganismAccountHolder";

//import { AccountHolderService } from '@/services/account-holder-service';

export default {
  components: {
    OrganismAccountHolder
  },

  data() {
    return {
      accountHolder: null,
    };
  },

  methods: {
    // async createNewAccountHolder() {
    //   return await AccountHolderService.create({ name: this.name });
    // },

    saveAccountHolder(accountHolder) {
      console.log(accountHolder);
    },
  }
}
</script>