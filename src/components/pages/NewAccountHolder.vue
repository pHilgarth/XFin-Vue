<template>
<!-- TODO remove style attribute again -->
  <div style="overflow:visible" class="new-account-holder">
    <OrganismAccountHolder headline="Kontoinhaber hinzufügen" @save="saveAccountHolder" />
    <!-- TODO - implement MoleculeLoading on every component, where an API call is made -->
  </div>
</template>

<script>
import OrganismAccountHolder from '@/components/organisms/OrganismAccountHolder';

import { AccountHolderService } from '@/services/account-holder-service';
import { BankAccountService } from "@/services/bank-account-service";
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
      //TODO - do I need a try catch here?
      const createdAccountHolder = await AccountHolderService.create({ name: accountHolder.name, userId: accountHolder.userId });
    
        if (createdAccountHolder) {
          for (let i = 0; i < accountHolder.bankAccounts.length; i++) {
            const bankAccount = accountHolder.bankAccounts[i];
            bankAccount.accountHolderId = createdAccountHolder.id;

            //TODO - and a try catch here?
            const createdBankAccount = await BankAccountService.create(bankAccount);
            console.log(createdBankAccount);

            if (createdBankAccount) {
              const initializationTransaction = {
                targetBankAccountId: createdBankAccount.id,
                //TODO - remove this hardcoded targetCostCenterId - it should fetch always the id of costCenter "Unallocated"!
                targetCostCenterId: 1,
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