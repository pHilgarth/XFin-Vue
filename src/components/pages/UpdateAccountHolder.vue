<template>
  <div v-if="dataLoaded" class="account-holder" style="display:block;overflow:visible">
    <OrganismAccountHolder headline="Kontoinhaber bearbeiten" :accountHolder="copiedAccountHolder" @save="updateAccountHolder" />
  </div>
</template>

<script>
import OrganismAccountHolder              from '@/components/organisms/OrganismAccountHolder';

import { AccountHolderService }           from '@/services/account-holder-service';
import { CopyService }                    from '@/services/copy-service';

export default {
  components: {
    OrganismAccountHolder,
  },

  async created() {
    const result = await this.getAccountHolder(this.$route.params.id);

    if (result.success) {
      this.dataLoaded = true;
    }
  },

  data() {
    return {
      dataLoaded: false,

      originalAccountHolder: null,
      copiedAccountHolder: null,
    };
  },

  methods: {
    async getAccountHolder(id) {
      const includeAccounts = true;
      this.originalAccountHolder = await AccountHolderService.get(id, includeAccounts);

      if (this.originalAccountHolder) {
        this.copiedAccountHolder = CopyService.copyObject(this.originalAccountHolder);
        return {
          success: true,
          error: null,
        };
      }
      else {
        return {
          success: false,
          error: 'Error while fetching accountHolder',
        };
      }
    },

    async updateAccountHolder(accountHolder) {
      if (this.originalAccountHolder.name !== accountHolder.name) {
        const namePatch = {
          op: "replace",
          path: `/name`,
          value: accountHolder.name,
        };
        const updateResponse = await AccountHolderService.update(this.originalAccountHolder.id, [namePatch]);

        if (!updateResponse.success) {
          alert(updateResponse.error);
        }
        else {
          this.$router.push('/');
        }
      }
      else {
          this.$router.push('/');
      }
    }
  }
}
</script>