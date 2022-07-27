<template>
  <section class="reserve-manager">
    <AtomHeadline tag="h1" text="Rücklagen" />
    <pre>{{selectedAccountHolderId}}</pre>
    <MoleculeLoading v-if="!accountHoldersLoaded" :loadingError="accountHoldersLoadingError" errorMessage="Fehler beim Laden der Kontoinhaber!"/>

    <template v-else>
      <MoleculeInputSelect class="reserve-manager__account-holder pb-5" :options="accountHolderOptions"
                           field="accountHolder" v-model="selectedAccountHolderId" label="Konto"/>

      <template v-if="selectedAccountHolderId > 0">
        <template v-for="bankAccount in accountHolders.find(a => a.id == selectedAccountHolderId).bankAccounts" :key="bankAccount.id">
          <OrganismCollapsibleWithSlot :title="bankAccount.accountNumber">
            <MoleculeReserveTable />
          </OrganismCollapsibleWithSlot>
        </template>
      </template>

      <AtomButton type="primary" text="Rücklage erstellen" @click.prevent="$router.push('/new-reserve')" />
    </template>
  </section>
</template>

<script>
import AtomButton from '@/components/atoms/AtomButton';
import AtomHeadline from '@/components/atoms/AtomHeadline';
import MoleculeInputSelect from '@/components/molecules/MoleculeInputSelect';
import MoleculeLoading from '@/components/molecules/MoleculeLoading';
import MoleculeReserveTable from "@/components/molecules/MoleculeReserveTable";

import { AccountHolderService } from '@/services/account-holder-service';
import OrganismCollapsibleWithSlot from "@/components/organisms/shared/OrganismCollapsibleWithSlot";

export default {
  async created() {
    const apiResponse = await this.getAccountHolders();

    if (apiResponse.success) {
      this.accountHoldersLoaded = true;
    } else {
      this.accountHoldersLoadingError = true;
    }
  },

  components: {
    AtomButton,
    OrganismCollapsibleWithSlot,
    AtomHeadline,
    MoleculeInputSelect,
    MoleculeLoading,
    MoleculeReserveTable,
    //OrganismCollapsible,
  },

  data() {
    return {
      accountHolders: [],
      accountHoldersLoaded: false,
      accountHoldersLoadingError: false,
      accountHolderOptions: null,
      selectedAccountHolderId : -1,
    }
  },

  methods: {
//TODO - die ganzen API-Calls müssen optimiert werden, bzw. das Error-Handling ...
    async getAccountHolders() {
      const accountHolderResponse = await AccountHolderService.getAll(true);

      if (accountHolderResponse.success && accountHolderResponse.data) {
        this.accountHolders = accountHolderResponse.data;

        this.accountHolderOptions = [{disabled: true, value: -1, label: '(Kontoinhaber wählen)'}];

        //TODO - check if i just can push a.name to accountHolderOptions
        this.accountHolders.forEach(a => {
          this.accountHolderOptions.push({
            value: a.id,
            label: a.name,
          });
        });
      } else if (accountHolderResponse.success && !accountHolderResponse.data) {
        this.accountHolders = [];
      }

      return accountHolderResponse;
    },

    getReserves(accountHolder) {
      console.log('bla bla bla ' + accountHolder.name);
    }
  },

  watch: {
    selectedAccountHolderId() {
      this.reserves = this.getReserves(this.accountHolders.find(a => a.id == this.selectedAccountHolderId));
    }
  }
};

</script>