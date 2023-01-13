<template>
  <!-- TODO - implement MoleculeLoading on every component, where an API call is made -->
  <div v-if="dataLoaded" class="edit-account-holder">
    <OrganismAccountHolder headline="Kontoinhaber bearbeiten" :accountHolder="copiedAccountHolder" @save="saveAccountHolder" />
  </div>
</template>

<script>
import OrganismAccountHolder              from '@/components/organisms/OrganismAccountHolder';

import { accountHolderService }           from '@/services/account-holder-service';
import { accountService }                 from '@/services/account-service';
import { copyService }                    from '@/services/copy-service';
import { transactionService }             from "@/services/transaction-service";

export default {
  components: {
    OrganismAccountHolder,
  },

  props: {
    accountHolderId: { type: String, required: true },
  },

  async created() {
    try {
      if (this.$cookies.get('user')) {
        this.user = this.$cookies.get('user');
      }

      this.originalAccountHolder = await accountHolderService.getSingle(this.accountHolderId);

      if (this.originalAccountHolder) {
        this.copiedAccountHolder = copyService.copyObject(this.originalAccountHolder);
      }
      this.dataLoaded = true;
    } catch (error) {
      this.loadingError = true;
      console.error(error);
    }
  },

  data() {
    return {
      copiedAccountHolder: null,
      dataLoaded: false,
      originalAccountHolder: null,
      user: null,
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

    async createInitializationTransactions(account) {
      await transactionService.create({
        targetBankAccountId: account.id,
        dateString: new Date().toISOString(),
        dueDateString: new Date().toISOString(),
        amount: account.balance,
        reference: '[Kontoinitialisierung]',
        executed: true,
        isCashTransaction: false,
        transactionType: 'Revenue',
      });

      if (account.cash > 0) {
        await transactionService.create({
          targetBankAccountId: account.id,
          dateString: new Date().toISOString(),
          dueDateString: new Date().toISOString(),
          amount: account.cash,
          reference: '[Bargeldinitialisierung]',
          executed: true,
          isCashTransaction: true,
          transactionType: 'Revenue'
        });
      }
    },

    async updateAccountHolder(accountHolder) {
      try {
        const namePatch = {
          op: "replace",
          path: `/name`,
          value: accountHolder.name,
        };

        await accountHolderService.update(this.originalAccountHolder.id, [ namePatch ]);
      }
      catch (error) {
        throw new Error(error);
      }
    },

    async saveAccountHolder(accountHolder) {
      try {
        if (this.originalAccountHolder.name !== accountHolder.name) {
          await this.updateAccountHolder(accountHolder);
        }

        const accountsToSave = accountHolder.bankAccounts.filter(b => b.changed || b.isNew);

        await this.saveAccounts(accountHolder.id, accountsToSave);

        this.$router.push('/accounts');
      } catch(error) {
        console.error(error);
        alert(error + ' - show something in frontend');
      }
    },

    async saveAccounts(accountHolderId, accounts) {
      try {
        for (let i = 0; i < accounts.length; i++) {
          const account = accounts[i];

          if (account.isNew) {
            //TODO - this code is duplicated in NewAccountHolder when creating the accounts
            account.accountHolderId = accountHolderId;

            const createdBankAccount = await accountService.create(account);
            account.id = createdBankAccount.id;

            await this.createInitializationTransactions(account);
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

            await accountService.update(account.id, jsonPatch);
          }
        }
      }
      catch (error) {
        throw new Error(error);
      }
    }
  }
}
</script>