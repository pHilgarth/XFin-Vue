<template>
  <div v-if="dataLoaded" class="account-holder" style="display:block">
    <OrganismAccountHolder headline="Kontoinhaber bearbeiten" :accountHolder="copiedAccountHolder" @save="updateAccountHolder" />
    <p style="margin-top:50px">{{ originalAccountHolder }}</p>
    <hr />
    <p style="margin-top:50px">{{ copiedAccountHolder }}</p>
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
    async updateBankAccounts() {
      for (let i = 0; i < this.copiedAccountHolder.bankAccounts.length; i++) {
        const originalBankAccount = this.originalAccountHolder.bankAccounts[i];
        const updatedBankAccount = this.copiedAccountHolder.bankAccounts[i];
        const jsonPatch = [];

        //if updatedBankAccount.id -> it's an existing account in db
        if (updatedBankAccount.id) {
          //TODO - on delete I would have an object, with the id and a property 'deleted: true'
          //TODO - then I would delete the account here, but that needs additional logic for existing transaction etc..
          if (updatedBankAccount.deleted) {
            //TODO - deletion of existing accounts not yet implemented
          }
          else {
            for (const prop in updatedBankAccount) {
              if (updatedBankAccount[prop] !== originalBankAccount[prop]) {
                jsonPatch.push({
                  op: "replace",
                  path: `/${prop}`,
                  value: updatedBankAccount[prop],
                });
              }
            }

            const updatedBankAccount = await InternalBankAccountService.update(updatedBankAccount.id, jsonPatch);

            if (!updatedBankAccount) {
              //TODO - error handling
              alert('error during bankAccount update');
              break;
            }
          }
        }
        //else -> no id -> new account
        else {
          updatedBankAccount.accountHolderId = this.originalAccountHolder.id;

          const createdBankAccount = await InternalBankAccountService.create(updatedBankAccount);

          if (!createdBankAccount) {
            //TODO - what if the accountHolder was created but the first account crashes? Then I have an accountHolder with no accounts.
            //TODO - In AccountView I can show only accountHolders that have accounts and the API could regularly delete invalid records
            alert('error during account creation');
            break;
          }
          else {
            const initializationTransaction = {
              internalBankAccountId: createdBankAccount.id,
              dateString: new Date().toISOString(),
              amount: updatedBankAccount.balance,
              reference: '[Kontoinitialisierung]',
            };

            await InternalTransactionService.create(initializationTransaction);

            if (!initializationTransaction) {
              //TODO - something went wrong - throw an error?
              alert('error during intialization transaction creation');
              break;
            }
          }
        }
      }
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
      if (this.originalAccountHolder.name !== accountHolder.name) {
        return await AccountHolderService.update({ id: accountHolder.id, name: accountHolder.name } );
      }

      await this.updateBankAccounts();
    }
  }
}
</script>