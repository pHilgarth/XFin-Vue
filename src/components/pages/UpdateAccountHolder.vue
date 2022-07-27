<template>
  <div v-if="dataLoaded" class="update-account-holder" style="display:block;overflow:visible">
    <OrganismAccountHolder headline="Kontoinhaber bearbeiten" :accountHolder="copiedAccountHolder" @save="updateAccountHolder" />
  </div>
</template>

<script>
import OrganismAccountHolder              from '@/components/organisms/OrganismAccountHolder';

import { AccountHolderService }           from '@/services/account-holder-service';
import { CopyService }                    from '@/services/copy-service';
import { InternalBankAccountService }     from '@/services/internal-bank-account-service';
import { InternalTransactionService }     from "@/services/internal-transaction-service";

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
    //TODO - maybe move this into a service
    checkForChanges(sourceAccount, bankAccount) {
      const subset = ({iban, bic, bank, description}) => ({iban, bic, bank, description});
      const sourceSubset = subset(sourceAccount);
      const updateSubset = subset(bankAccount);
      const changed = [];

      for (const prop in sourceSubset) {
        if (sourceSubset[prop] !== updateSubset[prop]) {
          changed.push(prop);
        }
      }

      return changed;
    },

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
      let error = false;

      if (this.originalAccountHolder.name !== accountHolder.name) {
        const namePatch = {
          op: "replace",
          path: `/name`,
          value: accountHolder.name,
        };
        const updateResponse = await AccountHolderService.update(this.originalAccountHolder.id, [namePatch]);

        if (!updateResponse.success) {
          error = true;
          alert(updateResponse.error);
        }
      }

      const accountsToSave = accountHolder.bankAccounts.filter(b => b.changed || b.isNew);
      console.log(accountsToSave);

      for (let i = 0; i < accountsToSave.length; i++) {
        const account = accountsToSave[i];

        if (account.isNew) {
          //TODO - this code is duplicated in NewAccountHolder when creating the accounts
          account.accountHolderId = accountHolder.id;

          const createdBankAccount = await InternalBankAccountService.create(account);

          if (createdBankAccount) {
            const initializationTransaction = {
              internalBankAccountId: createdBankAccount.id,
              dateString: new Date().toISOString(),
              amount: account.balance,
              reference: '[Kontoinitialisierung]',
            };
            const createdInitializationTransaction = await InternalTransactionService.create(initializationTransaction);
            if (!createdInitializationTransaction) {
              //TODO - improve error handling - maybe remove the other records again? Or just implement a task on the API that takes care of this regularly?
              this.error = 'Error during inizializationTransaction creation';
              alert(this.error);
            }
          }
          else {
            //TODO - improve error handling
            this.error = 'Error during bankAccountCreation';
            alert(this.error);
          }
        }
        else if (account.changed) {
          const sourceAccount = this.originalAccountHolder.bankAccounts[account.index];

          const jsonPatch = [];
          
          for (const prop of this.checkForChanges(sourceAccount, account)) {
            jsonPatch.push({
              op: "replace",
              path: `/${prop}`,
              value: account[prop],
            });
          }

          const updateResponse = await InternalBankAccountService.update(account.id, jsonPatch);

          if (!updateResponse.success) {
            error = true;
            alert(updateResponse.error);
          }
        }
      }

      if (!error) {
        this.$router.push('/');
      }
    }
  }
}
</script>