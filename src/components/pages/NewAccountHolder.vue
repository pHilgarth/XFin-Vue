<template>
  <div class="new-account-holder">
    <OrganismAccountHolder headline="Kontoinhaber hinzufügen" @save="saveAccountHolder" />
  </div>
</template>

<script>
import OrganismAccountHolder from '@/components/organisms/OrganismAccountHolder';

import { accountHolderService } from '@/services/account-holder-service';
import { accountService } from "@/services/account-service";
//import { costCenterService} from "@/services/cost-center-service";
import { transactionService }   from '@/services/transaction-service';

export default {
  created() {
    if (this.$cookies.get('user')) {
      this.user = this.$cookies.get('user');
    }
  },

  components: {
    OrganismAccountHolder
  },

  data() {
    return {
      user: null,
    };
  },

  methods: {
    async saveAccountHolder(accountHolder) {
      try {
        const createdAccountHolder = await accountHolderService.create({ name: accountHolder.name, userId: this.user.id });

        for (const bankAccount of accountHolder.bankAccounts) {
          bankAccount.userId = this.user.id;
          bankAccount.accountHolderId = createdAccountHolder.id;

          const createdBankAccount = await accountService.create(bankAccount);

          await transactionService.create({
            targetBankAccountId: createdBankAccount.id,
            dateString: new Date().toISOString(),
            dueDateString: new Date().toISOString(),
            amount: bankAccount.balance,
            reference: '[Kontoinitialisierung]',
            executed: true,
            isCashTransaction: false,
            transactionType: 'Revenue',
          });

          if (bankAccount.cash > 0) {
            await transactionService.create({
              targetBankAccountId: createdBankAccount.id,
              dateString: new Date().toISOString(),
              dueDateString: new Date().toISOString(),
              amount: bankAccount.cash,
              reference: '[Bargeldinitialisierung]',
              executed: true,
              isCashTransaction: true,
              transactionType: 'Revenue'
            });
          }

          this.$router.push('/accounts');
        }
      } catch(error) {
        console.error(error);
      }
    },
  }
}
</script>