<template>
  <!-- TODO - rework this component, the form rendering shouldnt be handeled with v-if -->
  <!-- TODO - maybe another component -->
  <div class="organism-account-holder">
    <section v-if="!showForm">
      <AtomHeadline tag="h1" :text="headline" />
      <article>
        <MoleculeInputText  class="organism-account-holder__name pb-5" field="name" :hasErrors="nameHasErrors || duplicatedName"
                            :validation="v$.name" v-model="name" label="Name" @blur="v$.name.$touch()"/>

        <template v-if="duplicatedName" to=".organism-account-holder__name">
          <AtomParagraph class="xfin__form__error organism-account-holder__name__error" text="Dieser Name wird bereits verwendet!"/>
        </template>

        <div class="organism-account-holder__accounts">
          <AtomHeadline class="account-holder__accounts__headline" tag="h4" text="Konten:" />
          <AtomButton text="&plus; Neues Konto anlegen" type="light" @click="addAccount"/>

          <div v-if="bankAccounts.length" class="organism-account-holder__account-items">
            <template v-for="(account, index) in bankAccounts" :key="index">
              <div class="organism-account-holder__account">
                <AtomSpan v-if="account.isNew" class="organism-account-holder__new" text="NEU" />
                <AtomSpan v-else-if="account.changed" class="organism-account-holder__changed" text="GEÄNDERT" />
                <AtomSpan class="organism-account-holder__delete" :data-index="index" text="&times;" @click="deleteAccount" />
                <AtomSpan class="organism-account-holder__account-number" :text="account.accountNumber" @click="deleteAccount" />
                <AtomSpan class="organism-account-holder__balance" :text="formatBalance(account.balance)" @click="deleteAccount" />
                <AtomButton :data-index="index" text="Bearbeiten" type="light-small" @click="editAccount" />
              </div>
            </template>
          </div>
        </div>
        <AtomButton :disabled="saveDisabled" text="Kontoinhaber speichern" type="primary" @click="saveAccountHolder" />
      </article>
    </section>
    <div v-else>
      <OrganismAccountForm @cancel="showForm = false" @save="saveAccount" :formData="formData" :headline="formHeadline"/>
    </div>
  </div>
</template>

<script>
import { useVuelidate } from '@vuelidate/core';

import AtomButton from '@/components/atoms/shared/AtomButton';
import AtomHeadline from '@/components/atoms/shared/AtomHeadline';
import AtomParagraph from '@/components/atoms/shared/AtomParagraph';
import AtomSpan from '@/components/atoms/shared/AtomSpan';
import MoleculeInputText from '@/components/molecules/shared/MoleculeInputText';
import OrganismAccountForm from '@/components/organisms/shared/OrganismAccountForm';

import { AccountHolderService } from '@/services/account-holder-service';
import { CopyService } from '@/services/copy-service';
import { NumberService } from '@/services/number-service';

import { accountHolderValidation } from '@/validation/validations';

export default {
  components: {
    AtomButton,
    AtomHeadline,
    AtomParagraph,
    AtomSpan,
    MoleculeInputText,
    OrganismAccountForm
  },

  emits: [ 'save' ],

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

    formatBalance(value) {
      return NumberService.formatCurrency(value);
    },

    saveAccount(event) {
      const bankAccount = {};

      for (const prop in event) {
        bankAccount[prop] = event[prop];
      }

      // if !this.accountHolder -> user is creating a new accountHolder
      if (!this.accountHolder) {
        bankAccount.isNew = true;

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

        //if !sourceAccount -> user created or edited a new account, which is not stored in the db yet
        if (!sourceAccount) {
          bankAccount.isNew = true;

          //if bankAccount.index -> user edited an existing account
          if (bankAccount.index >= 0) {
            this.bankAccounts[bankAccount.index] = bankAccount;
          } else {
            this.bankAccounts.push(bankAccount);
          }

          this.showForm = false;
        }
        else {
          bankAccount.changed = true;
          this.bankAccounts[bankAccount.index] = bankAccount;
          this.showForm = false;
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
        this.$emit('save', { id: this.accountHolder?.id, name: this.name, bankAccounts: this.bankAccounts });
      }
    },
  },

  setup() {
    return { v$: useVuelidate(), };
  },

  validations() { return accountHolderValidation; },
};
</script>