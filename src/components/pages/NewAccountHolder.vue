<template>
  <div class="account-holder">
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
    };
  },

  methods: {
    async saveAccountHolder(accountHolder) {
      this.accountHolder = accountHolder;
      //TODO - improve error handling, when API calls fail
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
                //TODO - error handling
                alert('Error during inizializationTransaction creation')
              }
            }
            else {
              //TODO - error handling
              alert('Error during bankAccountCreation');
            }
          }
        }
        else {
          //TODO - error handling
          alert('Error during accountHolder creation');
        }
    },
  }
}
</script>