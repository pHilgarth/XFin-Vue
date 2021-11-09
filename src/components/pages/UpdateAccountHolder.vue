<template>
  <OrganismAccountHolder />
</template>

<script>
import OrganismAccountHolder from '@/components/organisms/OrganismAccountHolder';

export default {
  components: {
    OrganismAccountHolder,
  },

  created() {
    // async created() {
    //   let result = null;
    //
    //   if (this.$route.params.id) {
    //     this.newAccountHolder = false;
    //     result = await this.getAccountHolder(this.$route.params.id);
    //   }
    //   else {
    //     this.newAccountHolder = true;
    //     result = {
    //       success: true,
    //       error: null,
    //     };
    //   }
    //
    //   if (result.success) {
    //     this.dataLoaded = true;
    //   }
    // },
  }
}
</script>