<template>
  <div class="organism-account-holder">
    <section>
      <AtomHeadline tag="h1" :text="headline" />
      <article>
        <MoleculeInputText  class="organism-account-holder__name pb-5" field="name" :hasErrors="v$.name.$error || duplicatedName"
                            :validation="v$.name" v-model="name" label="Name" @blur="v$.name.$touch()" :ignoreTab="showForm"/>

        <template v-if="duplicatedName" to=".organism-account-holder__name">
          <AtomParagraph class="xfin__form__error organism-account-holder__name__error" text="Dieser Name wird bereits verwendet!"/>
        </template>

        <div class="organism-account-holder__accounts">
          <AtomHeadline class="account-holder__accounts__headline mb-4" tag="h4" text="Konten:" />
          <AtomButton text="&plus; Neues Konto anlegen" type="light" @click="addAccount" :tabindex="showForm ? '-1' : ''" />

          <div v-if="bankAccounts.length" class="organism-account-holder__account-items">
            <!-- TODO - move this into another component? -->
            <template v-for="(account, index) in bankAccounts" :key="index">
              <div class="organism-account-holder__account col-12 col-md-3">
                <div class="organism-account-holder__account-wrapper">
                  <AtomSpan v-if="account.isNew" class="organism-account-holder__new" text="NEU" />
                  <AtomSpan v-else-if="account.changed" class="organism-account-holder__changed" text="GEÄNDERT" />
                  <AtomSpan class="organism-account-holder__delete" :data-index="index" text="&times;" @click="deleteAccount" />
                  <AtomSpan class="organism-account-holder__account-number" :text="account.accountNumber" />
                  <table class="organism-account-holder__account-data">
                    <tr class="organism-account-holder__iban">
                      <td>
                        <AtomSpan class="col-6" text="IBAN:" />
                      </td>
                      <td>
                        <AtomSpan class="col-6" :text="account.iban" />
                      </td>
                    </tr>
                    <tr class="organism-account-holder__bic">
                      <td>
                        <AtomSpan class="col-6" text="BIC:" />
                      </td>
                      <td>
                        <AtomSpan class="col-6" :text="account.bic" />
                      </td>
                    </tr>
                    <tr class="organism-account-holder__bank">
                      <td>
                        <AtomSpan class="col-6" text="Bank:" />
                      </td>
                      <td>
                        <AtomSpan class="col-6" :text="account.bank" />
                      </td>
                    </tr>
                    <tr class="organism-account-holder__description">
                      <td>
                        <AtomSpan class="col-6" text="Beschreibung:" />
                      </td>
                      <td>
                        <AtomSpan class="col-6" :text="account.description" />
                      </td>
                    </tr>
                    <tr class="organism-account-holder__balance">
                      <td>
                        <AtomSpan class="col-6" text="Kontostand:" />
                      </td>
                      <td>
                        <AtomSpan class="col-6"  :text="formatBalance(account.balance)" />
                      </td>
                    </tr>
                    <tr class="organism-account-holder__cash">
                      <td>
                        <AtomSpan class="col-6"  text="Bargeld:" />
                      </td>
                      <td>
                        <AtomSpan class="col-6"  :text="formatBalance(account.cash)" />
                      </td>
                    </tr>
                  </table>
                  <div class="d-flex justify-content-end">
                    <AtomButton class="organism-account-holder__edit-account" :data-index="index" text="Bearbeiten" type="light-small" @click="editAccount" />
                  </div>
                </div>
              </div>
            </template>
          </div>
        </div>
        <AtomButton :disabled="saveDisabled" text="Kontoinhaber speichern" type="primary" @click="saveAccountHolder" />
      </article>
    </section>
    <div v-if="showForm">
      <OrganismAccountForm @cancel="showForm = false" @save="saveAccount" :formData="formData" :headline="formHeadline"/>
    </div>
  </div>
</template>

<script>
import { useVuelidate } from '@vuelidate/core';

import AtomButton from '@/components/atoms/AtomButton';
import AtomHeadline from '@/components/atoms/AtomHeadline';
import AtomParagraph from '@/components/atoms/AtomParagraph';
import AtomSpan from '@/components/atoms/AtomSpan';
import MoleculeInputText from '@/components/molecules/MoleculeInputText';
import OrganismAccountForm from '@/components/organisms/OrganismAccountForm';

import { accountHolderService } from '@/services/account-holder-service';
import { copyService } from '@/services/copy-service';
import { numberService } from '@/services/number-service';

import { accountHolderValidation } from '@/validation/validations';

export default {
  created() {
    if (this.$cookies.get('user')) {
      this.user = this.$cookies.get('user');
    }
  },

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
    accountHolder:  { type: Object, default: null },
    headline:       { type: String, required: true },
  },

  computed: {
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
      bankAccounts: copyService.copyArray(this.accountHolder?.bankAccounts || []),
      formData: null,
      formHeadline: null,
      user: null,
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
      return numberService.formatCurrency(value);
    },

    saveAccount(bankAccount) {
      //TODO - refactoring.... this method is an if-else-hell....
      // if !this.accountHolder: user is creating a new accountHolder
      if (!this.accountHolder) {
        bankAccount.isNew = true;

        //if bankAccount.index >= 0: user edited an existing account
        if (bankAccount.index >= 0) {
          this.bankAccounts[bankAccount.index] = bankAccount;
        } else {
          this.bankAccounts.push(bankAccount);
        }
      
        this.showForm = false;
      }
      //else: user is editing an existing accountHolder
      else {
        const sourceAccount = this.accountHolder.bankAccounts[bankAccount.index];

        //if !sourceAccount: user created or edited a new account, which is not stored in the db yet
        if (!sourceAccount) {
          bankAccount.isNew = true;

          //if bankAccount.index >= 0: user edited an existing account
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
      let save = false;

      if (this.originalName !== this.name) {
        try {
          const accountHolderDuplicate = await accountHolderService.getByUserAndName(this.user.id, this.name);

          if (!accountHolderDuplicate) {
            save = true;
          }
          else {
            this.duplicatedName = true;
          }
        } catch (error) {
          console.error('could not check for duplicates! Aborting!');
          console.error(error);
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