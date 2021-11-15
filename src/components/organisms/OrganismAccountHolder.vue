<template>
  <section v-if="!showForm" class="account-holder__main">
    <AtomHeadline tag="h1" :text="headline" />
    <article>
      <MoleculeInputText  classList="account-holder__name pb-5" field="name" :hasErrors="nameHasErrors || duplicatedName"
                          :validation="v$.name" v-model="name" label="Name" @blur="v$.name.$touch()"/>

      <teleport v-if="duplicatedName" to=".account-holder__name">
        <AtomParagraph class="xfin-form__error" text="Dieser Name wird bereits verwendet!"/>
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
import { useVuelidate } from '@vuelidate/core';

import AtomButtonLight from '@/components/atoms/AtomButtonLight';
import AtomHeadline from '@/components/atoms/AtomHeadline';
import AtomParagraph from '@/components/atoms/AtomParagraph';
import AtomSpan from '@/components/atoms/AtomSpan';
import MoleculeInputText from '@/components/molecules/MoleculeInputText';
import OrganismAccountForm from '@/components/organisms/OrganismAccountForm';

import { AccountHolderService } from '@/services/account-holder-service';
import { CopyService } from '@/services/copy-service';
import { InternalBankAccountService }     from '@/services/internal-bank-account-service';
import { InternalTransactionService }     from "@/services/internal-transaction-service";

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
    accountHolder: { type: Object, default: null },
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

      name: this.accountHolder?.name || '',
      originalName: this.accountHolder?.name || '',
      duplicatedName: false,
      bankAccounts: CopyService.copyArray(this.accountHolder?.bankAccounts || []),
      formData: null,
      formHeadline: null,
    };
  },

  methods: {
    addAccount() {
      this.formHeadline = 'Konto hinzufügen';
      this.showForm = true;
    },

    //TODO - can I move this function into a service? It's duplicated in AccountSettings.vue
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

    async saveAccount(event) {
      const bankAccount = {};

      for (const prop in event) {
        bankAccount[prop] = event[prop];
      }

      // if !this.accountHolder -> user is creating a new accountHolder
      if (!this.accountHolder) {
        //if bankAccount.index -> user edited an existing account
        if (bankAccount.index >= 0) {
          this.bankAccounts[bankAccount.index] = bankAccount;
        } else {
          this.bankAccounts.push(bankAccount);
        }
      
        this.showForm = false;
      }
      //else -> user is editing an existing accountHolder
      else {
        const sourceAccount = this.accountHolder.bankAccounts[bankAccount.index];

        if (!sourceAccount) {
          //TODO - this code is duplicated in NewAccountHolder when creating the accounts
          bankAccount.accountHolderId = this.accountHolder.id;

          const createdBankAccount = await InternalBankAccountService.create(bankAccount);

          if (createdBankAccount) {
            const initializationTransaction = {
              internalBankAccountId: createdBankAccount.id,
              dateString: new Date().toISOString(),
              amount: bankAccount.balance,
              reference: '[Kontoinitialisierung]',
            };
            const createdInitializationTransaction = await InternalTransactionService.create(initializationTransaction);
            if (createdInitializationTransaction) {
              this.bankAccounts.push(bankAccount);
              this.showForm = false;
            }
            else {
              //TODO - improve error handling - maybe remove the other records again? Or just implement a task on the API that takes care of this regularly?
              this.error = 'Error during inizializationTransaction creation';
              alert(this.error);
            }
          }
          else {
            //TODO - improve error handling
            this.error = 'Error during bankAccountCreation';
            alert(this.error);
          }
        }
        else {
          const jsonPatch = [];
          
          for (const prop of this.checkForChanges(sourceAccount, bankAccount)) {
            jsonPatch.push({
              op: "replace",
              path: `/${prop}`,
              value: bankAccount[prop],
            });
          }

          const updateResponse = await InternalBankAccountService.update(bankAccount.id, jsonPatch);

          if (!updateResponse.success) {
            alert(updateResponse.error);
          }
          else {
            this.bankAccounts[bankAccount.index] = bankAccount;
            this.showForm = false;
          }
        }
      }
    },

    async saveAccountHolder() {
      let duplicateCheckResponse = null;
      let save = false;

      if (this.originalName !== this.name) {
        duplicateCheckResponse = await AccountHolderService.getByName(this.name);

        if (duplicateCheckResponse.success && !duplicateCheckResponse.duplicate) {
          save = true;
        }
        else if (duplicateCheckResponse.success && duplicateCheckResponse.duplicate) {
          this.duplicatedName = true;
        }
        else if (!duplicateCheckResponse.success) {
          //TODO - show something in frontend
          alert('Error during duplicated name check');
          console.error(duplicateCheckResponse.error);
        }
      }
      else {
        save = true;
      }

      if (save) {
        this.$emit('save', { name: this.name, bankAccounts: this.bankAccounts });
      }
    },
  },

  setup() {
    return { v$: useVuelidate(), };
  },

  validations() { return accountHolderValidation; },
};
</script>