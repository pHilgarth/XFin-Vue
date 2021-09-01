<template>
  <div class="edit-account-holder">
    <h1>Kontoinhaber bearbeiten</h1>
    <section class="loading" v-if="loading">
      <div>Daten werden geladen ...</div>
    </section>
    <section class="loading-error" v-else-if="!accountHolder">
      <div class="fetching-error">Fehler beim Laden der Kontoinhaber!</div>
    </section>
    <section class="edit-account-holder-body" v-else>
      <form class="xfin-form">
        <div class="xfin-form__section">
          <div class="xfin-form__group row">
            <label class="xfin-form__label col-3" for="name">Name:</label>
            <input id="name" :class="{ 'xfin-form__control col-4': true, 'has-errors': v$.name.$error }" type="text" :disabled="accountHolderNameDisabled"
              v-model="name" @blur="v$.name.$touch" @keyup="enforceMaxLength('name', 15)" />
            <button class="xfin-form__button btn btn-primary" @click.prevent="toggleAccountHolderNameField">
              {{ accountHolderNameDisabled ? "[edit]" : "X" }}
            </button>
            <button
              class="xfin-form__button btn btn-primary" @click.prevent="saveAccountHolderName" v-if="!accountHolderNameDisabled">
              Speichern
            </button>
            <p class="xfin-form__error" v-if="v$.name.$error">
              Bitte gib einen Namen an!
            </p>
          </div>
        </div>
        <div class="xfin-form__section">
          <div class="xfin-form__group row">
            <label class="xfin-form__label col-3" for="account">Konto:</label>
            <label class="xfin-form__label col-4" v-if="pendingAccountCreation">
              (Neues Konto)
              </label>
            <select class="xfin-form__control xfin-form__select col-4" v-model="selectedAccountIndex" @change="loadAccountData"
                    v-if="bankAccounts.length && !pendingAccountCreation" :disabled="pendingAccountEdit">
              <option v-for="(account, index) in bankAccounts" :key="index" :value="index">
                {{ account.accountNumber }}
              </option>
            </select>
            <button
              class="xfin-form__button btn btn-primary" @click.prevent="draftAccount" :disabled="pendingAccountEdit">
              {{ pendingAccountCreation ? "&times;" : "&plus;" }}
            </button>
            <p class="xfin-form__error" v-if="v$.selectedAccountIndex.$error">
              Bitte erstelle mindestens ein Konto!
            </p>
          </div>
          <div class="xfin-form__section account-data" v-if="pendingAccountCreation || bankAccounts.length">
            <div class="xfin-form__group row">
              <label class="xfin-form__label col-3" for="iban">IBAN:</label>
              <input id="iban" :class="{ 'xfin-form__control col-4': true, 'has-errors': v$.iban.$error }" :disabled="!pendingAccountCreation && !pendingAccountEdit"
                type="text" v-model="iban" @blur="v$.iban.$touch" />
              <p class="xfin-form__error" v-if="v$.iban.$error">
                Bitte gib eine gültige IBAN an!
              </p>
            </div>
            <div class="xfin-form__group row">
              <label class="xfin-form__label col-3" for="bic">BIC:</label>
              <input id="bic" :class="{ 'xfin-form__control col-4': true, 'has-errors': v$.bic.$error }" :disabled="!pendingAccountCreation && !pendingAccountEdit"
                type="text" v-model="bic" @blur="v$.bic.$touch" />
              <p class="xfin-form__error" v-if="v$.bic.$error">
                Bitte gib einen gültigen BIC an!
              </p>
            </div>
            <div class="xfin-form__group row">
              <label class="xfin-form__label col-3" for="bank">Bank:</label>
              <input id="bank" :class="{ 'xfin-form__control col-4': true, 'has-errors': v$.bank.$error }" :disabled="!pendingAccountCreation && !pendingAccountEdit"
                type="text" v-model="bank" @blur="v$.bank.$touch" @keyup="enforceMaxLength('bank', 50)" />
              <p class="xfin-form__error" v-if="v$.bank.$error">
                Bitte gib eine Bank an!
              </p>
            </div>
            <div class="xfin-form__group row">
              <label class="xfin-form__label col-3" for="description">
                Beschreibung
                </label>
              <input id="description" class="xfin-form__control col-4" :disabled="!pendingAccountCreation && !pendingAccountEdit" type="text"
                      placeholder="(optional)" v-model="description" @keyup="enforceMaxLength('description', 15)" />
            </div>
            <div class="xfin-form__group row" v-if="pendingAccountCreation">
              <label class="xfin-form__label col-3" for="balance">
                Kontostand
                </label>
              <input id="balance" :class="{ 'xfin-form__control col-4': true, 'has-errors': v$.balance.$error }"
                      :disabled="!pendingAccountCreation && !pendingAccountEdit" type="text" v-model="balance" @blur="v$.balance.$touch" />
              <p class="xfin-form__error" v-if="v$.balance.$error">
                Bitte gib einen gültigen Konstostand an!
              </p>
            </div>
            <button class="xfin-form__button btn btn-primary btn-submit-account" @click.prevent="addAccount" v-if="pendingAccountCreation">
              Konto speichern
            </button>
            <button class="xfin-form__button btn btn-primary btn-edit-account" v-else @click.prevent="toggleEditAccount">
              {{ !pendingAccountEdit ? "Konto bearbeiten" : "Abbrechen" }}
            </button>
            <button class="xfin-form__button btn btn-primary btn-update-account" v-if="pendingAccountEdit"
                    @click.prevent="updateAccount">
              Änderungen speichern
            </button>
            <button class="xfin-form__button btn btn-primary btn-delete-account" title="Konto entfernen" v-if="!pendingAccountCreation && !pendingAccountEdit"
              @click.prevent="deleteAccount">
              [Trash]
            </button>
          </div>
        </div>
      </form>
    </section>
  </div>
</template>

<script>
import { useVuelidate } from "@vuelidate/core";
import { required } from "@vuelidate/validators";

import { AccountHolderService } from "@/services/account-holder-service";
import { InternalBankAccountService } from "@/services/internal-bank-account-service";
import { NumberService } from "@/services/number-service.js";

import {
  bicValidator,
  ibanValidator,
  balanceValidator,
  dropDownValidator,
} from "@/custom-validators/custom-validators";

export default {
  beforeMount() {
    this.getAccountHolder();
  },
  data() {
    return {
      accountHolder: null,
      selectedAccountIndex: 0,

      accountHolderNameDisabled: false,
      loading: true,
      pendingAccountCreation: false,
      pendingAccountEdit: false,

      name: "",
      iban: "",
      bic: "",
      bank: "",
      description: "",
      balance: "",
      bankAccounts: [],
    };
  },

  methods: {
    async addAccount() {
      if (this.validateAccountFields()) {
        const newBankAccount = {
          accountHolderId: this.accountHolder.id,
          accountNumber: NumberService.getAccountNumber(this.iban),
          iban: this.iban.toUpperCase(),
          bic: this.bic.toUpperCase(),
          bank: this.bank,
          description: this.description,
          balance: parseFloat(this.balance.replaceAll(".", "").replace(",", ".")),
        }
        
        const createdBankAccount = await InternalBankAccountService.createInternalBankAccount(newBankAccount);

        if (createdBankAccount) {
          this.accountHolder.bankAccounts.push(newBankAccount);
          this.bankAccounts.push(newBankAccount);
          this.selectedAccountIndex = this.bankAccounts.length - 1;

          this.pendingAccountCreation = false;
          this.loadAccountData();
        }
      }
    },

    //TODO - relocate this copy function into some kind of service - it's reusable
    copyArray(sourceArray) {
      const targetArray = [];

      sourceArray.forEach((element) => {
        if (typeof element !== "object") {
          targetArray.push(element);
        } else if (Array.isArray(element)) {
          targetArray.push(this.copyArray(element));
        } else {
          targetArray.push(this.copyObject(element));
        }
      });

      return targetArray;
    },

    //TODO - relocate this copy function into some kind of service - it's reusable
    copyObject(sourceObject) {
      if (sourceObject === null) {
        return null;
      }

      const targetObject = {};

      for (let prop in sourceObject) {
        if (typeof sourceObject[prop] !== "object") {
          targetObject[prop] = sourceObject[prop];
        } else if (Array.isArray(sourceObject[prop])) {
          //prop == object, array, function or null
          targetObject[prop] = this.copyArray(sourceObject[prop]);
        } else {
          targetObject[prop] = this.copyObject(sourceObject[prop]);
        }
      }

      return targetObject;
    },

    deleteAccount() {
      alert('not implemented yet!');
    },

    draftAccount() {
      this.pendingAccountCreation = !this.pendingAccountCreation;

      if (this.pendingAccountCreation) {
        this.selectedAccountIndex = -1;
      } else {
        this.selectedAccountIndex = 0;
      }

      this.loadAccountData();
    },

    enforceMaxLength(field, length) {
      if (this[field].length > length) {
        this[field] = this[field].slice(0, length);
      }
    },

    async getAccountHolder() {
      const includeAccounts = true;
      const simpleBankAccounts = true;

      this.accountHolder = await AccountHolderService.getAccountHolder(this.$route.params.id, includeAccounts, simpleBankAccounts);

      if (this.accountHolder) {
          this.accountHolder.bankAccounts.forEach(bankAccount => {
              bankAccount.accountNumber = NumberService.getAccountNumber(bankAccount.iban);
          });

          this.bankAccounts = this.copyArray(this.accountHolder.bankAccounts);

          this.accountHolderNameDisabled = true;
          this.name = this.accountHolder.name;
          this.loadAccountData();
      }

      this.loading = false;
    },

    loadAccountData() {
      if (this.selectedAccountIndex == -1) {
        this.iban = "";
        this.bic = "";
        this.bank = "";
        this.description = "";
        this.balance = "";

        this.v$.$reset();
      } else {
        this.iban = this.bankAccounts[this.selectedAccountIndex].iban;
        this.bic = this.bankAccounts[this.selectedAccountIndex].bic;
        this.bank = this.bankAccounts[this.selectedAccountIndex].bank;
        this.description = this.bankAccounts[this.selectedAccountIndex].description;
      }
    },

    async saveAccountHolderName() {
      this.v$.name.$touch();

      if (!this.v$.name.$errors.length) {
        const accountHolderUpdate = {
          id: this.accountHolder.id,
          name: this.name,
        };

        const updatedAccountHolder = await AccountHolderService.updateAccountHolder(accountHolderUpdate);

        if (updatedAccountHolder != null) {
          this.accountHolder.name = this.name;
        } else {
          this.name = this.accountHolder.name;
        }

        this.accountHolderNameDisabled = true;
      }
    },

    toggleAccountHolderNameField() {
      this.accountHolderNameDisabled = !this.accountHolderNameDisabled;

      if (this.accountHolderNameDisabled) {
        this.name = this.accountHolder.name;
      }
    },

    toggleEditAccount() {
      this.pendingAccountEdit = !this.pendingAccountEdit;

      if (!this.pendingAccountEdit) {
        this.loadAccountData();
      }
    },

    async updateAccount() {
      if (this.validateAccountFields()) {
        const jsonPatchDocument = [];
        const sourceBankAccount = this.accountHolder.bankAccounts[this.selectedAccountIndex];
        let updatedBankAccount = this.bankAccounts[this.selectedAccountIndex];

        updatedBankAccount.iban = this.iban.toUpperCase();
        updatedBankAccount.bic = this.bic.toUpperCase();
        updatedBankAccount.bank = this.bank;
        updatedBankAccount.description = this.description;

        for (const prop in updatedBankAccount) {
          if (updatedBankAccount[prop] !== sourceBankAccount[prop]) {
            //TODO - dont include revenues and expenses in bankAccount on accountholder view!
            if (prop !== "revenues" && prop !== "expenses") {
              jsonPatchDocument.push({
                op: "replace",
                path: `/${prop}`,
                value: updatedBankAccount[prop],
              });
            }
          }
        }

        await InternalBankAccountService.updateInternalBankAccount(updatedBankAccount.id, jsonPatchDocument);

        this.pendingAccountEdit = false;
      }
    },

    validateAccountFields() {
      this.v$.iban.$touch();
      this.v$.bic.$touch();
      this.v$.bank.$touch();
      
      if (this.pendingAccountCreation) {
        this.v$.balance.$touch();
      }

      if (this.$route.params.id == 0) {
        this.v$.balance.$touch();
      }

      if (!this.v$.$errors.length) {
        return true;
      }
    },
  },
  setup() {
    return {
      v$: useVuelidate(),
    };
  },

  validations() {
    return {
      name: { required },
      iban: { required, ibanValidator },
      bic: { required, bicValidator },
      bank: { required },
      balance: { required, balanceValidator },
      selectedAccountIndex: { dropDownValidator },
    };
  },
};
</script>