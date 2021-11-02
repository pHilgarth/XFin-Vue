<template>

  <div class="new-revenue">
    <section class="revenue-form-body">
      <h1>Einnahme eintragen</h1>
      <!-- TODO - start using vuetify to implement a combobox for source selection-->

      <form class="xfin-account-form" v-if="bankAccountOptions">
        <MoleculeInputSelect classList="new-revenue__account" :options="bankAccountOptions" field="account" v-model="selectedAccountNumber" label="Konto" />
        <MoleculeInputSelect classList="new-revenue__category" :options="categoryOptions" field="category" v-model="selectedCategoryIndex" label="Kostenstelle" />
        
        <MoleculeInputSelect :options="sources" field="source" v-if="sources.length && !pendingSourceCreation"/>
        <MoleculeInputText v-else field="source" :hasErrors="sourceErrors" v-model="source" :validation="v$.source" label="Quelle" @blur="v$.source.$touch()" />
        <!-- {{ sources.length }}
        {{ sources[0]}}
        {{ !pendingSourceCreation }} -->


        <MoleculeInputText field="reference" v-model="reference" :optional="true" label="Verwendungszweck" />
        <MoleculeInputText field="amount" :hasErrors="amountErrors" v-model="amount" :validation="v$.amount" label="Betrag" @blur="v$.amount.$touch()" />

       <AtomButton classList="xfin-form__button" text="Speichern" :disabled="v$.$silentErrors.length" @click.prevent="save" />

      </form>
    </section>
  </div>
</template>

<script>
import { useVuelidate } from "@vuelidate/core";
import { revenueValidation } from "@/validation/validations";

import { NumberService } from '@/services/number-service';
import { AccountHolderService } from "@/services/account-holder-service";
import { ExternalBankAccountService } from "@/services/external-bank-account-service";
import { ExternalPartyService } from "@/services/external-party-service";
import { InternalTransactionService } from "@/services/internal-transaction-service";
import { ExternalTransactionService } from "@/services/external-transaction-service";
import { TransactionCategoryService } from '@/services/transaction-category-service.js';

import AtomButton                       from '@/components/atoms/AtomButton';
import MoleculeInputText                from '@/components/molecules/MoleculeInputText';
import MoleculeInputSelect              from "@/components/molecules/MoleculeInputSelect";
//import MoleculeInputText from "../molecules/MoleculeInputText";

export default {
  async created() {
    await this.getBankAccountOptions();
    this.getExternalParties();
    this.getTransactionCategories();
  },

  components: {
    MoleculeInputText,
    AtomButton,
    MoleculeInputSelect
  },

  computed: {
    amountErrors() { return this.v$.amount.$error },
    sourceErrors() { return this.v$.source.$error },
  },

  data() {
    return {
      //TODO - refactor this
      amount: '',
      reference: '',
      newSource: '',
      selectedSource: null,
      
      selectedAccountNumber: '',
      selectedAccountId: 0,

      selectedSourceIndex: 0,
      selectedSourceBankAccountId: null,
      selectedCategoryIndex: 0,
      selectedCategoryId: null,

      accountHolders: null,
      categories: null,
      categoryOptions: [],
      bankAccountOptions: null,
      sources: [],
      initialSourcesLength: 0,

      pendingSourceCreation: false,
      unsavedSource: false,
    };
  },

  methods: {
    changeCategory() {
      this.selectedCategoryId = this.categories[this.selectedCategoryIndex].id;
    },

    changeSource() {
      this.selectedSourceBankAccountId = this.sources[this.selectedSourceIndex].externalBankAccountId;
    },

    findAccountId(accountNumber) {
      for (let i = 0; i < this.accountHolders.length; i++) {
        const accountHolder = this.accountHolders[i];
        const account = accountHolder.bankAccounts.find(b => b.accountNumber == accountNumber);

        if (account) {
          this.selectedAccountId = account.id;
          break;
        }
      }
    },

    async getBankAccountOptions() {
      const includeBankAccounts = true;
      this.accountHolders = await AccountHolderService.getAll(includeBankAccounts);

      if (this.accountHolders) {
        this.bankAccountOptions = [];
        //   for (let i = 0; i < this.accountHolders.length; i++) {
        //   const accountHolder = this.accountHolders[i];

        //   this.bankAccountOptions.push({
        //     value: accountHolder.name,
        //     disabled: true,
        //   });

        //   for (let ii = 0; ii < accountHolder.bankAccounts.length; ii++) {
        //     const bankAccount = accountHolder.bankAccounts[ii];

        //     this.bankAccountOptions.push({
        //       value: bankAccount.accountNumber,
        //       disabled: false,
        //     });

        //     if (bankAccount.id == this.$route.params.id) {
        //       this.selectedAccount = bankAccount.accountNumber;
        //     }
        //   }
        // }

        this.accountHolders.forEach(accountHolder => {
          this.bankAccountOptions.push({
            value: accountHolder.name,
            disabled: true,
          });

          accountHolder.bankAccounts.forEach(bankAccount => {
            this.bankAccountOptions.push({
              value: bankAccount.accountNumber,
              disabled: false,
            });

            if (bankAccount.id == this.$route.params.id) {
              this.selectedAccountNumber = bankAccount.accountNumber;
            }
          });
        });
      }
    },

    async getExternalParties() {
      this.sources = await ExternalPartyService.getExternalParties();
      if (this.sources.length === 0) {
        //e
      }
      else {
        this.selectedSourceBankAccountId = this.sources[0].externalBankAccountId;
        this.initialSourcesLength = this.sources.length;

        const sourceOptions = [];
        this.sources.forEach(source => {
          sourceOptions.push(source.name);
        });

        this.sources = sourceOptions;
      }
    },

    async getTransactionCategories() {
      this.categories = await TransactionCategoryService.getTransactionCategories();

      if (this.categories) {
        this.categories.forEach(category => {
          this.categoryOptions.push({
            value: category.name,
            disabled: false,
          });
        })
        
        this.selectedCategoryId = this.categories[0].id;
      }
      else {
        //TODO - throw error, do something
        console.log('no cats');
      }
    },

    async save() {
      //this.v$.newSource.$reset();

      if (!this.sources.length) {
        if (this.validateSourceField() & this.validateRevenueFields()) {
          const externalParty = {
            name: this.newSource
          };
          const createdExternalParty = await ExternalPartyService.createExternalParty(externalParty);

          const externalBankAccount = {
            externalPartyId: createdExternalParty.id
          };
          const createdExternalBankAccount = await ExternalBankAccountService.createExternalBankAccount(externalBankAccount);

          const externalBankAccountId = createdExternalBankAccount.id;
          const currentDate = new Date().toISOString();
          const amount = NumberService.parseFloat(this.amount);

          const externalTransaction = {
            externalBankAccountId: externalBankAccountId,
            dateString: currentDate,
            amount: amount * -1,
            reference: this.reference
          };
          const createdExternalTransaction = await ExternalTransactionService.createExternalTransaction(externalTransaction);

          const internalTransaction = {
            internalBankAccountId: this.selectedAccountId,
            transactionCategoryId: this.selectedCategoryId,
            dateString: currentDate,
            amount: amount,
            reference: this.reference,
            counterPartTransactionToken: createdExternalTransaction.transactionToken,
            transactionToken: createdExternalTransaction.counterPartTransactionToken
          };
          await InternalTransactionService.create(internalTransaction);
        }
      }
      else {
        if (this.pendingSourceCreation) {
          this.unsavedSource = true;
          this.validateRevenueFields();
        }
        else {
          let externalBankAccountId;

          if (this.sources.length !== this.initialSourcesLength) {
            const externalParty = {
              name: this.newSource
            };
            const createdExternalParty = await ExternalPartyService.createExternalParty(externalParty);
            
            const externalBankAccount = {
              externalPartyId: createdExternalParty.id
            };

            const createdExternalBankAccount = await ExternalBankAccountService.createExternalBankAccount(externalBankAccount);
            externalBankAccountId = createdExternalBankAccount.id;
          }
          else {
            externalBankAccountId = this.selectedSourceBankAccountId;
          }

          const currentDate = new Date().toISOString();
          const amount = NumberService.parseFloat(this.amount);

          const externalTransaction = {
            externalBankAccountId: externalBankAccountId,
            dateString: currentDate,
            amount: amount * -1,
            reference: this.reference
          };
          const createdExternalTransaction = await ExternalTransactionService.createExternalTransaction(externalTransaction);

          const internalTransaction = {
            internalBankAccountId: this.selectedAccountId,
            transactionCategoryId: this.selectedCategoryId,
            dateString: currentDate,
            amount: amount,
            reference: this.reference,
            counterPartTransactionToken: createdExternalTransaction.transactionToken,
            transactionToken: createdExternalTransaction.counterPartTransactionToken
          };
          await InternalTransactionService.create(internalTransaction);
        }
      }
    },

  saveSource() {
    this.unsavedSource = false;
    if (this.validateSourceField()) {
      if (this.sources.length > this.initialSourcesLength) {
        this.sources.pop();
      }

      this.sources.push({
        id: -1,
        name: this.newSource
      });
      
      this.unsavedSource = false;

      this.pendingSourceCreation = false;
      this.selectedSourceIndex = this.sources.length - 1;
    }
  },

    toggleSourceCreation() {
      this.pendingSourceCreation = !this.pendingSourceCreation;
      this.unsavedSource = false;

      if (!this.pendingSourceCreation) {
        this.selectedSourceIndex = 0;
        this.newSource = '';
      }
    },

    validateSourceField() {
      this.v$.newSource.$touch();

      if (!this.v$.newSource.$errors.length) {
        return true;
      }
    }
  },

  setup() {
    return {
      v$: useVuelidate(),
    };
  },

  validations() { return revenueValidation;
    // return {
    //   amount: { required, amountValidator },
    //   reference: { required },
    //   newSource: { required }
    // };
  },
};
</script>