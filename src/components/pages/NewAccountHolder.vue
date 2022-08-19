<template>
  <div class="new-account-holder">
    <OrganismAccountHolder headline="Kontoinhaber hinzufügen" @save="saveAccountHolder" />
  </div>
</template>

<script>
import OrganismAccountHolder from '@/components/organisms/OrganismAccountHolder';

import { AccountHolderService } from '@/services/account-holder-service';
import { BankAccountService } from "@/services/bank-account-service";
import { TransactionService }   from '@/services/transaction-service';

export default {
  inject: [ 'userId' ],

  components: {
    OrganismAccountHolder
  },

  data() {
    return {
      //accountHolder: null,
      //error: null,
    };
  },

  methods: {
    async saveAccountHolder(accountHolder) {
      try {
        const createdAccountHolder = await AccountHolderService.create({ name: accountHolder.name, userId: this.userId });

        for (const bankAccount of accountHolder.bankAccounts) {
          bankAccount.accountHolderId = createdAccountHolder.id;

          const createdBankAccount = await BankAccountService.create(bankAccount);

          await TransactionService.create({
            targetBankAccountId: createdBankAccount.id,
            dateString: new Date().toISOString(),
            amount: bankAccount.balance,
            reference: '[Kontoinitialisierung]',
          });

          this.$router.push('/');
        }
      } catch(error) {
        console.error(error);
        alert(error + ' - show something in frontend');
      }
    },
  }
}
</script>