<template>
  <div class="new-revenue">
    <AtomHeadline tag="h1" text="Einnahme eintragen" />
    <OrganismTransaction transactionType="revenue" />
  </div>
</template>

<script>
  import AtomHeadline from '@/components/atoms/AtomHeadline';
  import OrganismTransaction from '@/components/organisms/OrganismTransaction';

  import { AccountHolderService } from '@/services/account-holder-service';

  export default {
    //TODO - rework these nested api calls ...
    async created() {
      let apiResponse = await this.getAccountHolders();

      if (apiResponse.success) {
        apiResponse = await this.getExternalParties();

        if (apiResponse.success) {
          apiResponse = await this.getCostCenters();

          if (apiResponse.success) {
            this.dataLoaded = true;
          } else {
            this.loadingError = true;
            console.error(apiResponse.error);
          }
        } else {
          this.loadingError = true;
          console.error(apiResponse.error);
        }
      } else {
        this.loadingError = true;
        console.error(apiResponse.error);
      }
    },

    components: {
      AtomHeadline,
      OrganismTransaction,
    },

    methods: {
      async getAccountHolders() {
        const apiResponse = await AccountHolderService.getAll();

        if (apiResponse.success && apiResponse.data) {
          this.accountHolders = apiResponse.data;
          this.bankAccountOptions = [];

          this.accountHolders.forEach((accountHolder) => {
            this.bankAccountOptions.push({
              label: accountHolder.name,
              disabled: true,
            });

            accountHolder.bankAccounts.forEach((bankAccount) => {
              this.bankAccountOptions.push({
                value: bankAccount.id,
                label: bankAccount.accountNumber,
              });

              //TODO - this doesnt belong into this function, it should live in its own
              //select the account which matches the id in the url
              if (bankAccount.id == this.$route.params.id) {
                this.selectedAccount = bankAccount;
              }
            });
          });
        } else if (apiResponse.success && !apiResponse.data) {
          this.accountHolders = [];
        }

        return apiResponse;
      },

      async saveRevenue() {

      }
    }
  };
</script>