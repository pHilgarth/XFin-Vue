<template>
  <section v-if="!showForm" class="account-holder__main">
    <AtomHeadline tag="h1" :text="headline" />
    <article>
      <MoleculeInputText  classList="account-holder__name pb-5" field="name" :hasErrors="nameHasErrors || duplicatedName"
                          :validation="v$.name" v-model="name" label="Name" @blur="v$.name.$touch()"/>

      <teleport v-if="duplicatedName" to=".account-holder__name">
        <AtomParagraph classList="xfin-form__error" text="Dieser Name wird bereits verwendet!"/>
      </teleport>

      <div class="account-holder__accounts">
        <AtomHeadline classList="account-holder__accounts-headline" tag="h4" text="Konten:" />
        <AtomButtonLight classList="xfin-button--light" text="&plus; Neues Konto anlegen" @click="addAccount"/>

        <div v-if="bankAccounts.length" class="account-holder__account-items">
          <template v-for="(account, index) in bankAccounts" :key="index">
            <!-- TODO cursor:pointer only above the X and the "Edit" button -->
            <!-- TODO background-color red for the X and color white -->
            <div class="account-holder__account">
              <AtomSpan class="account-holder__delete" :data-index="index" text="&times;" @click="deleteAccount" />
              <span class="account-holder__account-number">{{ account.accountNumber }}</span>
              <AtomButtonLight classList="account-holder__edit xfin-button&#45;&#45;light" :data-index="index" text="Bearbeiten" @click="editAccount" />
            </div>
          </template>
        </div>
      </div>
      <button class="xfin-button" @click="saveAccountHolder" :disabled="saveDisabled">Kontoinhaber speichern</button>

    </article>
  </section>
  <div v-else class="account-holder__form">
    <!-- TODO when clicking on the 'addAccount' light button, the AccountForm should expand below the button instead of how it is at the moment -->
    <OrganismAccountForm @cancel="showForm = false" @save="saveAccount" :formData="formData" :headline="formHeadline"/>
  </div>
</template>

<script>
import { useVuelidate } from "@vuelidate/core";

import AtomButtonLight from "@/components/atoms/AtomButtonLight";
import AtomHeadline from "@/components/atoms/AtomHeadline";
import AtomParagraph from '@/components/atoms/AtomParagraph';
import AtomSpan from '@/components/atoms/AtomSpan';
import MoleculeInputText from "@/components/molecules/MoleculeInputText";
import OrganismAccountForm from "@/components/organisms/OrganismAccountForm";

import { AccountHolderService } from "@/services/account-holder-service";
//import { NumberService } from "@/services/number-service";

import { accountHolderValidation } from '@/validation/validations';

export default {
  components: {
    AtomButtonLight,
    AtomHeadline,
    AtomParagraph,
    AtomSpan,
    MoleculeInputText,
    OrganismAccountForm
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
      this.duplicatedName = null;
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
      duplicatedName: null,
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

    deleteAccount(event) {
      //TODO - show modal to confirm deletion
      const index = event.target.dataset.index;

      //if the account to delete has an id, it's already stored in the db and the deletion needs additional logic - not yet implemented
      if (this.bankAccounts[index].id) {
      //TODO - implement deletion of accounts stored in db
      alert('deletion of accounts stored in db not yet implemented!');
      }
      else {
        this.bankAccounts.splice(event.target.dataset.index, 1);
      }
    },

    editAccount(event) {
      this.formHeadline = 'Konto bearbeiten';
      this.formData = {
        account: this.bankAccounts[event.target.dataset.index],
        //accountIndex is needed to find the right account to update
        accountIndex: parseInt(event.target.dataset.index),
        ibans: this.bankAccounts.map(b => b.iban),
      };
      this.showForm = true;
    },

    saveAccount(event) {
      const newBankAccount = {};
      for (const prop in event) {
        newBankAccount[prop] = event[prop];
      }
      //if newBankAccount.index -> user edited an existing account
      if (newBankAccount.index >= 0) {
        this.bankAccounts[newBankAccount.index] = newBankAccount;
      } else {
        this.bankAccounts.push(newBankAccount);
      }
    
      this.showForm = false;
    },

    async saveAccountHolder() {
      this.duplicatedName = await AccountHolderService.getByName(this.name);

      if (!this.duplicatedName) {
        this.$emit('save', { name: this.name, bankAccounts: this.bankAccounts });
      }
      // else {
      //   //TODO - update accountHolder
      //   if (this.nameChanged) {
      //     const updatedAccountHolder = await this.saveName();
    
      //     if (updatedAccountHolder.duplicate) {
      //       this.duplicateName = true;
      //       return;
      //     }
      //   }
    
      //   if (this.accountsChanged) {
      //     for (let i = 0; i < this.updatedBankAccounts.length; i++) {
      //       const bankAccount = this.updatedBankAccounts[i];
      //       bankAccount.iban = bankAccount.iban.toUpperCase();
      //       bankAccount.bic = bankAccount.bic.toUpperCase();
      //       const jsonPatch = [];
      //       if (bankAccount.id && bankAccount.changed) {
      //         for (const prop of bankAccount.changed) {
      //           jsonPatch.push({
      //             op: "replace",
      //             path: `/${prop}`,
      //             value: bankAccount[prop],
      //           });
      //         }
    
      //         await InternalBankAccountService.update(bankAccount.id, jsonPatch);
      //       }
      //       else if (!bankAccount.id) {
    
      //         bankAccount.accountHolderId = this.$route.params.id;
      //         bankAccount.iban = bankAccount.iban.toUpperCase();
      //         bankAccount.bic = bankAccount.bic.toUpperCase();
      //         const createdBankAccount = await InternalBankAccountService.create(bankAccount);
    
      //         if (!createdBankAccount) {
      //           //TODO - what if the account was created but the first account crashes? Then I have an accountHolder with no accounts.
      //           //In AccountView I can show only accountHolders that have accounts
      //           alert('error during account creation');
      //           break;
      //         }
      //         else {
      //           const initializationTransaction = {
      //             internalBankAccountId: createdBankAccount.id,
      //             dateString: new Date().toISOString(),
      //             amount: bankAccount.balance,
      //             reference: '[Kontoinitialisierung]',
      //           };
    
      //           await InternalTransactionService.create(initializationTransaction);
    
      //           if (!initializationTransaction) {
      //             //TODO - something went wrong - throw an error?
      //           }
      //           this.$router.push('/');
      //         }
      //       }
      //       //if bankAccount.newAccount => it's a newly created account
      //     }
      //     // for (let i = 0; i < this.updatedBankAccounts.length; i++) {
      //     // const updatedBankAccount = this.updatedBankAccounts[i];
      //     //
      //     // //const createdBankAccount = await InternalBankAccountService.create(updatedBankAccount);
      //     //
      //     // if (!createdBankAccount) {
      //     //   //TODO - what if the account was created but the first account crashes? Then I have an accountHolder with no accounts.
      //     //   //In AccountView I can show only accountHolders that have accounts
      //     //   alert('error during account creation');
      //     //   break;
      //     // }
      //     // }
      //   }
    
      //   this.$router.push('/');
      // }
    },
  },

  setup() {
    return { v$: useVuelidate(), };
  },

  validations() { return accountHolderValidation; },
};
</script>