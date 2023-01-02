<template>
  <div class="new-account-holder">
    <OrganismAccountHolder headline="Kontoinhaber hinzufügen" @save="saveAccountHolder" />
  </div>
</template>

<script>
import OrganismAccountHolder from '@/components/organisms/OrganismAccountHolder';

import { accountHolderService } from '@/services/account-holder-service';
import { accountService } from "@/services/account-service";
import { costCenterService} from "@/services/cost-center-service";
import { transactionService }   from '@/services/transaction-service';

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
        const createdAccountHolder = await accountHolderService.create({ name: accountHolder.name, userId: this.userId });

        for (const bankAccount of accountHolder.bankAccounts) {
          bankAccount.accountHolderId = createdAccountHolder.id;

          const createdBankAccount = await accountService.create(bankAccount);
          const unallocatedCostCenter = await costCenterService.getSingleByName('Nicht zugewiesen');
          const cashCostCenter = await costCenterService.getSingleByName('Bargeldbestand');

          await transactionService.create({
            targetBankAccountId: createdBankAccount.id,
            targetCostCenterId: unallocatedCostCenter.id,
            dateString: new Date().toISOString(),
            dueDateString: new Date().toISOString(),
            amount: bankAccount.balance,
            reference: '[Kontoinitialisierung]',
            executed: true,
            transactionType: 'Revenue',
          });

          if (bankAccount.cash > 0) {
            await transactionService.create({
              targetBankAccountId: createdBankAccount.id,
              targetCostCenterId: cashCostCenter.id,
              dateString: new Date().toISOString(),
              dueDateString: new Date().toISOString(),
              amount: bankAccount.cash,
              reference: '[Bargeldinitialisierung]',
              executed: true,
              transactionType: 'Revenue'
            });
          }

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