<template>
  <div v-if="!showForm" class="account-holder__main">
    <AtomHeadline tag="h1" :text="headline" />
    <section>
      <MoleculeInputText  classList="account-holder__name pb-5" field="name" :hasErrors="nameHasErrors || duplicatedName"
                          :validation="v$.name" v-model="name" label="Name" @blur="v$.name.$touch()"/>

      <teleport v-if="duplicatedName" to=".account-holder__name">
        <AtomParagraph classList="xfin-form__error" text="Dieser Name wird bereits verwendet!"/>
      </teleport>

      <div class="account-holder__accounts">
        <AtomHeadline classList="account-holder__accounts-headline" tag="h4" text="Konten:" />
        <AtomButtonLight classList="xfin-button--light" text="&plus; Neues Konto anlegen" @click="addAccount"/>

<!--        <div v-if="bankAccounts.length" class="account-holder__account-items">-->
<!--          <template v-for="(account, index) in bankAccounts" :key="index">-->
<!--            <div class="account-holder__account">-->
<!--              <AtomDelete class="account-holder__delete" :data-index="index" @click="deleteAccount"/>-->
<!--              <span class="account-holder__account-number">{{ account.accountNumber }}</span>-->
<!--              <AtomButtonLight classList="account-holder__edit xfin-button&#45;&#45;light" :data-index="index" text="Bearbeiten" @click="editAccount" />-->
<!--            </div>-->
<!--          </template>-->
<!--        </div>-->
      </div>
      <button class="xfin-button" @click="save" :disabled="saveDisabled">Kontoinhaber speichern</button>

    </section>
  </div>
  <div v-else class="account-holder__form">
    <OrganismAccountForm @cancel="showForm = false" @save="saveAccount" :formData="formData" :headline="formHeadline"/>
  </div>
</template>

<script>
import { useVuelidate } from "@vuelidate/core";

import AtomButtonLight from "@/components/atoms/AtomButtonLight";
// import AtomDelete from "@/components/atoms/AtomDelete";
import AtomHeadline from "@/components/atoms/AtomHeadline";
import AtomParagraph from '@/components/atoms/AtomParagraph';
import MoleculeInputText from "@/components/molecules/MoleculeInputText";
import OrganismAccountForm from "@/components/organisms/OrganismAccountForm";

//import { AccountHolderService } from "@/services/account-holder-service";
import { InternalBankAccountService } from "@/services/internal-bank-account-service";
import { InternalTransactionService }   from '@/services/internal-transaction-service';
//import { NumberService } from "@/services/number-service";

import { accountHolderValidation } from '@/validation/validations';

export default {
  components: {
    AtomButtonLight,
    // AtomDelete,
    AtomHeadline,
    AtomParagraph,
    MoleculeInputText,
    OrganismAccountForm,
  },

  props: {
    accountHolder: {
      type: Object,
      default() {
        return {
          name: '',
          bankAccounts: [],
        };
      },
    },
    headline: { type: String, required: true },
  },

  computed: {
    nameHasErrors() {
      return this.v$.name.$error;
    },
    saveDisabled() {
      return this.v$.name.$invalid || this.duplicatedName || !this.bankAccounts.length
    },
  },

  watch: {
    name() {
      this.v$.name.$touch();
      this.duplicatedName = false;
    },
    showForm() {
      if (this.showForm) {
        this.formData = this.formData
          ? this.formData
          : { ibans: this.bankAccounts.map(b => b.iban), }
      } else {
        this.formData = null;
      }
    },
  },

  data() {
    return {
      showForm: false,

      name: this.accountHolder.name,
      duplicatedName: false,
      bankAccounts: this.accountHolder.bankAccounts,
      formData: null,
      formHeadline: null,
    };
  },

  methods: {
    addAccount() {
      this.formHeadline = 'Konto hinzufügen';
      this.showForm = true;
    },

    async createBankAccount(bankAccount) {
      return await InternalBankAccountService.create(bankAccount);
    },

    async createInitializationTransaction(transaction) {
      return await InternalTransactionService.create(transaction);
    },

    deleteAccount(event) {
      //TODO - this code comes from old NewAccountHolder - deletion of persisted accounts not implemented yet
      //TODO - show modal to confirm deletion
      this.bankAccounts.splice(event.target.dataset.index, 1);
    },

    editAccount(event) {
      this.formHeadline = 'Konto bearbeiten';
      this.formData = {
        account: this.bankAccounts[event.target.dataset.index],
        ibans: this.bankAccounts.map((b) => b.iban),
      };
      this.showForm = true;
    },

    // saveAccount(event) {
    //   const newBankAccount = {
    //     accountNumber: NumberService.getAccountNumber(event.iban),
    //     iban: event.iban,
    //     bic: event.bic,
    //     bank: event.bank,
    //     description: event.description,
    //     balance: event.balance,
    //   };
    //   //if event.accountNumber -> user edited an existing account
    //   if (event.accountNumber) {
    //     const index = this.bankAccounts.findIndex(b => b.accountNUmber === event.accountNumber);
    //     this.bankAccounts[index] = newBankAccount;
    //   } else {
    //     this.bankAccounts = this.bankAccounts ? this.bankAccounts : [];
    //
    //     this.bankAccounts.push(newBankAccount);
    //   }
    //
    //   this.showForm = false;
    // },

    // async saveAccountHolder() {
    //   const duplicate = await AccountHolderService.getByName(this.name);
    //
    //   if (duplicate) {
    //     this.duplicatedName = true;
    //   }
    //   else if (this.newAccountHolder) {
    //     const createdAccountHolder = await this.createNewAccountHolder;
    //
    //     if (createdAccountHolder) {
    //       for (let i = 0; i < this.bankAccounts.length; i++) {
    //         const bankAccount = this.bankAccounts[i];
    //         bankAccount.accountHolderId = createdAccountHolder.id;
    //         //TODO - test if iban and bic are still uppercase
    //         // bankAccount.iban = bankAccount.iban.toUpperCase();
    //         // bankAccount.bic = bankAccount.bic.toUpperCase();
    //
    //         const createdBankAccount = await this.createBankAccount(bankAccount);
    //
    //         if (createdBankAccount) {
    //           const initializationTransaction = {
    //             internalBankAccountId: createdBankAccount.id,
    //             dateString: new Date().toISOString(),
    //             amount: createdBankAccount.balance,
    //             reference: '[Kontoinitialisierung]',
    //           };
    //           const createdInitializationTransaction = await this.createInitializationTransaction(initializationTransaction);
    //
    //           if (!createdInitializationTransaction) {
    //             //TODO - error handling
    //             alert('Error during inizializationTransaction creation')
    //           }
    //         }
    //         else {
    //           //TODO - error handling
    //           alert('Error during account creation');
    //         }
    //       }
    //     }
    //     else {
    //       //TODO - error handling
    //       alert('Error during accountHolder creation');
    //     }
    //   }
    //   else {
    //     //TODO - update accountHolder
    //     if (this.nameChanged) {
    //       const updatedAccountHolder = await this.saveName();
    //
    //       if (updatedAccountHolder.duplicate) {
    //         this.duplicateName = true;
    //         return;
    //       }
    //     }
    //
    //     if (this.accountsChanged) {
    //       for (let i = 0; i < this.updatedBankAccounts.length; i++) {
    //         const bankAccount = this.updatedBankAccounts[i];
    //         bankAccount.iban = bankAccount.iban.toUpperCase();
    //         bankAccount.bic = bankAccount.bic.toUpperCase();
    //         const jsonPatch = [];
    //         if (bankAccount.id && bankAccount.changed) {
    //           for (const prop of bankAccount.changed) {
    //             jsonPatch.push({
    //               op: "replace",
    //               path: `/${prop}`,
    //               value: bankAccount[prop],
    //             });
    //           }
    //
    //           await InternalBankAccountService.update(bankAccount.id, jsonPatch);
    //         }
    //         else if (!bankAccount.id) {
    //
    //           bankAccount.accountHolderId = this.$route.params.id;
    //           bankAccount.iban = bankAccount.iban.toUpperCase();
    //           bankAccount.bic = bankAccount.bic.toUpperCase();
    //           const createdBankAccount = await InternalBankAccountService.create(bankAccount);
    //
    //           if (!createdBankAccount) {
    //             //TODO - what if the account was created but the first account crashes? Then I have an accountHolder with no accounts.
    //             //In AccountView I can show only accountHolders that have accounts
    //             alert('error during account creation');
    //             break;
    //           }
    //           else {
    //             const initializationTransaction = {
    //               internalBankAccountId: createdBankAccount.id,
    //               dateString: new Date().toISOString(),
    //               amount: bankAccount.balance,
    //               reference: '[Kontoinitialisierung]',
    //             };
    //
    //             await InternalTransactionService.create(initializationTransaction);
    //
    //             if (!initializationTransaction) {
    //               //TODO - something went wrong - throw an error?
    //             }
    //             this.$router.push('/');
    //           }
    //         }
    //         //if bankAccount.newAccount => it's a newly created account
    //       }
    //       // for (let i = 0; i < this.updatedBankAccounts.length; i++) {
    //       // const updatedBankAccount = this.updatedBankAccounts[i];
    //       //
    //       // //const createdBankAccount = await InternalBankAccountService.create(updatedBankAccount);
    //       //
    //       // if (!createdBankAccount) {
    //       //   //TODO - what if the account was created but the first account crashes? Then I have an accountHolder with no accounts.
    //       //   //In AccountView I can show only accountHolders that have accounts
    //       //   alert('error during account creation');
    //       //   break;
    //       // }
    //       // }
    //     }
    //
    //     this.$router.push('/');
    //   }
    // },
  },

  setup() {
    return { v$: useVuelidate(), };
  },

  validations() { return accountHolderValidation; },
};
</script>