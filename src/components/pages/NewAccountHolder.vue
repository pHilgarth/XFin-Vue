<template>
<!-- TODO remove style attribute again -->
  <div style="overflow:visible" class="account-holder">
    <OrganismAccountHolder headline="Kontoinhaber hinzufügen" @save="saveAccountHolder" />
    <!-- TODO - implement MoleculeLoading on every component, where an API call is made -->
  </div>
</template>

<script>
import OrganismAccountHolder from "@/components/organisms/OrganismAccountHolder";

import { AccountHolderService } from '@/services/account-holder-service';
import { InternalBankAccountService } from "@/services/internal-bank-account-service";
import { InternalTransactionService }   from '@/services/internal-transaction-service';

export default {
  components: {
    OrganismAccountHolder
  },

  data() {
    return {
      accountHolder: null,
      error: null,
    };
  },

  methods: {
    async saveAccountHolder(accountHolder) {
      this.accountHolder = accountHolder;
      const createdAccountHolder = await AccountHolderService.create({ name: accountHolder.name });
    
        if (createdAccountHolder) {
          for (let i = 0; i < accountHolder.bankAccounts.length; i++) {
            const bankAccount = accountHolder.bankAccounts[i];
            bankAccount.accountHolderId = createdAccountHolder.id;

            const createdBankAccount = await InternalBankAccountService.create(bankAccount);

            if (createdBankAccount) {
              const initializationTransaction = {
                internalBankAccountId: createdBankAccount.id,
                dateString: new Date().toISOString(),
                amount: bankAccount.balance,
                reference: '[Kontoinitialisierung]',
              };
              const createdInitializationTransaction = await InternalTransactionService.create(initializationTransaction);

              if (!createdInitializationTransaction) {
                //TODO - improve error handling - maybe remove the other records again? Or just implement a task on the API that takes care of this regularly?
                this.error = 'Error during inizializationTransaction creation';
                alert(this.error);
                break;
              }
            }
            else {
              //TODO - improve error handling
              this.error = 'Error during bankAccountCreation';
              alert(this.error);
              break;
            }
          }

          if (!this.error) {
            this.$router.push('/');
          }
        }
        else {
          //TODO - improve error handling
          this.error = 'Error during accountHolder creation';
          alert(this.error);
        }
    },
  }
}
</script>