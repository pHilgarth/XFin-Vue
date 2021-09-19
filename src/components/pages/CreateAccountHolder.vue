<template>
  <div class="create-account-holder">
    <section class="create-account-holder-body">
      <h1>Kontoinhaber hinzufügen</h1>
      <form class="xfin-form">
        <div class="xfin-form__section">
          <div class="xfin-form__group row">
            <label class="xfin-form__label col-3" for="name">Name:</label>
            <input id="name" :class="{'xfin-form__control col-4': true, 'has-errors': v$.name.$error}"
              type="text" v-model="name" @blur="v$.name.$touch" @keyup="enforceMaxLength('name', 15)" />
            <p class="xfin-form__error" v-if="v$.name.$error">
              Bitte gib einen Namen an!
            </p>
          </div>
        </div>
        <div class="xfin-form__section">
          <div class="xfin-form__group row">
            <label class="xfin-form__label col-3" for="account">Konto:</label>
            <label class="xfin-form__label col-4" v-if="pendingAccountCreation">(Neues Konto)</label>
            <select class="xfin-form__control xfin-form__select col-4" v-model="selectedAccountIndex" @change="loadAccountData"
              v-if="bankAccounts.length && !pendingAccountCreation" :disabled="pendingAccountEdit">
              <option v-for="(account, index) in bankAccounts" :key="index" :value="index">
                {{ account.accountNumber }}
              </option>
            </select>
            <button class="xfin-form__button btn btn-primary" @click.prevent="toggleAccountCreation" v-if="!pendingAccountEdit">
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
              <input id="bic" :class="{'xfin-form__control col-4': true,  'has-errors': v$.bic.$error}" :disabled="!pendingAccountCreation && !pendingAccountEdit"
                type="text" v-model="bic" @blur="v$.bic.$touch" />
              <p class="xfin-form__error" v-if="v$.bic.$error">
                Bitte gib einen gültigen BIC an!
              </p>
            </div>
            <div class="xfin-form__group row">
              <label class="xfin-form__label col-3" for="bank">Bank:</label>
              <input id="bank" :class="{'xfin-form__control col-4': true, 'has-errors': v$.bank.$error }" :disabled="!pendingAccountCreation && !pendingAccountEdit"
                type="text" v-model="bank" @blur="v$.bank.$touch" @keyup="enforceMaxLength('bank', 30)" />
              <p class="xfin-form__error" v-if="v$.bank.$error">
                Bitte gib eine Bank an!
              </p>
            </div>
            <div class="xfin-form__group row">
              <label class="xfin-form__label col-3" for="description">Beschreibung</label>
              <input id="description" class="xfin-form__control col-4" :disabled="!pendingAccountCreation && !pendingAccountEdit" type="text" placeholder="(optional)"
                v-model="description" @keyup="enforceMaxLength('description', 15)" />
            </div>
            <div class="xfin-form__group row">
              <label class="xfin-form__label col-3" for="balance">Kontostand</label>
              <input id="balance" :class="{ 'xfin-form__control col-4': true, 'has-errors': v$.balance.$error }"
                :disabled="!pendingAccountCreation && !pendingAccountEdit" type="text" v-model="balance" @blur="v$.balance.$touch" />
              <p class="xfin-form__error" v-if="v$.balance.$error">
                Bitte gib einen gültigen Konstostand an!
              </p>
            </div>
            <button class="xfin-form__button btn btn-primary btn-submit-account" @click.prevent="addAccount" v-if="selectedAccountIndex == -1">
              Konto speichern
            </button>
            <button class="xfin-form__button btn btn-primary btn-edit-account" v-else @click.prevent="toggleAccountEdit">
              {{ !pendingAccountEdit ? "Konto bearbeiten" : "Abbrechen" }}
            </button>
            <button class="xfin-form__button btn btn-primary btn-update-account" v-if="selectedAccountIndex != -1 && pendingAccountEdit"
              @click.prevent="updateAccount">
              Änderungen speichern
            </button>
            <button class="xfin-form__button btn btn-primary btn-delete-account" title="Konto entfernen" v-if="selectedAccountIndex != -1 && !pendingAccountEdit"
              @click.prevent="deleteAccount">
              [Trash]
            </button>
          </div>
        </div>
        <button class="xfin-form__button btn btn-primary btn-submit-form" @click.prevent="saveAccountHolder" :disabled="pendingAccountCreation || pendingAccountEdit">
          Kontoinhaber speichern
        </button>
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
  data() {
    return {
      selectedAccountIndex: -1,

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
    addAccount() {
      if (this.validateAccountFields()) {
        this.bankAccounts.push({
          accountNumber: NumberService.getAccountNumber(this.iban),
          iban: this.iban.toUpperCase(),
          bic: this.bic.toUpperCase(),
          bank: this.bank,
          description: this.description,
          balance: parseFloat(this.balance.replaceAll(".", "").replace(",", "."))
        });

        this.pendingAccountCreation = false;
        this.selectedAccountIndex = this.bankAccounts.length - 1;
        this.loadAccountData();
      }
    },

    deleteAccount() {
      this.bankAccounts.splice(this.selectedAccountIndex, 1);

      this.selectedAccountIndex = this.bankAccounts.length ? 0 : -1;
      this.loadAccountData();
    },

    enforceMaxLength(field, length) {
      if (this[field].length > length) {
        this[field] = this[field].slice(0, length);
      }
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
        this.balance = this.bankAccounts[this.selectedAccountIndex].balance.toString().replace('.', ',');
      }
    },

    async saveAccountHolder() {
      this.v$.$touch();

      if (!this.v$.$errors.length) {
        const newAccountHolder = await AccountHolderService.createAccountHolder( { name: this.name } );

        if (newAccountHolder) {
            for (const bankAccount of this.bankAccounts) {
                bankAccount.accountHolderId = newAccountHolder.id;

                await InternalBankAccountService.createInternalBankAccount(bankAccount);
            }

            this.$router.push('/');
        }
      }
    },

    toggleAccountCreation() {
      this.pendingAccountCreation = !this.pendingAccountCreation;

      if (this.pendingAccountCreation || !this.bankAccounts.length) {
        this.selectedAccountIndex = -1;
      } else {
        this.selectedAccountIndex = 0;
      }

      this.loadAccountData();
    },

    toggleAccountEdit() {
      this.pendingAccountEdit = !this.pendingAccountEdit

      if (!this.pendingAccountEdit) {
        this.loadAccountData();
      }
    },

    updateAccount() {
      if (this.validateAccountFields()) {
        const bankAccount = this.bankAccounts[this.selectedAccountIndex];

        bankAccount.accountNumber = NumberService.getAccountNumber(this.iban);
        bankAccount.iban = this.iban.toUpperCase();
        bankAccount.bic = this.bic.toUpperCase();
        bankAccount.bank = this.bank;
        bankAccount.description = this.description;
        bankAccount.balance = parseFloat(this.balance.replaceAll(".", "").replace(",", "."));

        this.pendingAccountEdit = false;

        this.loadAccountData();
      }
    },

    validateAccountFields() {
      this.v$.iban.$touch();
      this.v$.bic.$touch();
      this.v$.bank.$touch();
      this.v$.balance.$touch();

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