<template>
  <!-- TODO - implement MoleculeLoading on every component, where an API call is made -->
  <div v-if="dataLoaded" class="edit-account-holder">
    <OrganismAccountHolder headline="Kontoinhaber bearbeiten" :accountHolder="copiedAccountHolder" @save="updateAccountHolder" />
  </div>
</template>

<script>
import OrganismAccountHolder              from '@/components/organisms/OrganismAccountHolder';

import { AccountHolderService }           from '@/services/account-holder-service';
import { CopyService }                    from '@/services/copy-service';
import { BankAccountService }     from '@/services/bank-account-service';
import { TransactionService }     from "@/services/transaction-service";

export default {
  components: {
    OrganismAccountHolder,
  },

  props: {
    accountHolderId: { type: String, required: true },
  },

  async created() {
    try {
      this.originalAccountHolder = await AccountHolderService.getSingle(this.accountHolderId);

      if (this.originalAccountHolder) {
        this.copiedAccountHolder = CopyService.copyObject(this.originalAccountHolder);
      }
      this.dataLoaded = true;
    } catch (error) {
      this.loadingError = true;
      console.error(error);
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

    async updateAccountHolder(accountHolder) {
      let error = false;

      if (this.originalAccountHolder.name !== accountHolder.name) {
        const namePatch = {
          op: "replace",
          path: `/name`,
          value: accountHolder.name,
        };

        try {
          await AccountHolderService.update(this.originalAccountHolder.id, [ namePatch ]);
        } catch(error) {
          console.error(error)
        }
      }

      const accountsToSave = accountHolder.bankAccounts.filter(b => b.changed || b.isNew);

      for (let i = 0; i < accountsToSave.length; i++) {
        const account = accountsToSave[i];

        if (account.isNew) {
          //TODO - this code is duplicated in NewAccountHolder when creating the accounts
          account.accountHolderId = accountHolder.id;

          const createdBankAccount = await BankAccountService.create(account);

          if (createdBankAccount) {
            const initializationTransaction = {
              internalBankAccountId: createdBankAccount.id,
              dateString: new Date().toISOString(),
              amount: account.balance,
              reference: '[Kontoinitialisierung]',
            };
            const createdInitializationTransaction = await TransactionService.create(initializationTransaction);
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

          const updateResponse = await BankAccountService.update(account.id, jsonPatch);

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