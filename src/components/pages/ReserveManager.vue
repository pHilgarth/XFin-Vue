<template>
  <section class="reserve-manager">
    <AtomHeadline tag="h1" text="Rücklagen" />
    <MoleculeLoading v-if="!accountHoldersLoaded" :loadingError="accountHoldersLoadingError" errorMessage="Fehler beim Laden der Kontoinhaber!"/>

    <template v-else>
      <MoleculeInputSelect class="reserve-manager__account-holder pb-5" :options="accountHolderOptions"
                           field="accountHolder" v-model="selectedAccountHolderId" label="Konto"/>

      <template v-if="selectedAccountHolderId > 0 && this.reserves">
        <template v-for="bankAccount in accountHolders.find(a => a.id == selectedAccountHolderId).bankAccounts" :key="bankAccount.id">
          <OrganismCollapsibleWithSlot :title="bankAccount.accountNumber" v-if="reserves[bankAccount.id].length > 0">
            <MoleculeReserveTable :reserves="reserves[bankAccount.id]" />
          </OrganismCollapsibleWithSlot>
        </template>
      </template>
      <AtomParagraph v-else-if="selectedAccountHolderId > 0" text="Keine Rücklagen vorhanden!"/>
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

import {AccountHolderService} from '@/services/account-holder-service';
import {ReserveService} from '@/services/reserve-service';
import OrganismCollapsibleWithSlot from '@/components/organisms/OrganismCollapsibleWithSlot';
import AtomParagraph from "../atoms/AtomParagraph";

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
    AtomParagraph,
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
      reserves: null,
    }
  },

  methods: {
//TODO - die ganzen API-Calls müssen optimiert werden, bzw. das Error-Handling ...
    async getAccountHolders() {
      const accountHolderResponse = await AccountHolderService.getAllByUser(true);

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

    async getReserves(accountHolderId) {
      //return ReserveService.getAllByAccountHolder(accountHolderId);
      return await ReserveService.getAll(accountHolderId);
    }
  },

  watch: {
    async selectedAccountHolderId() {
      const apiResponse = await this.getReserves(this.accountHolders.find(a => a.id == this.selectedAccountHolderId).id);

      if (apiResponse.success && apiResponse.data) {
        if (apiResponse.data.length > 0) {
          const bankAccountIds = this.accountHolders.find(a => a.id == this.selectedAccountHolderId).bankAccounts.map(b => b.id);

          this.reserves = {}

          //TODO - check if I can use triple equal sign (===) (so if its both number type)
          bankAccountIds.forEach(id => {
            this.reserves[id] = apiResponse.data.filter(r => r.internalBankAccountId == id);
          });
        }
      }
      else if (apiResponse.success && !apiResponse.data) {
        console.log('success with no data');
      }
    }
  }
};

</script>