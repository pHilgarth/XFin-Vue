<template>
  <div class="create-account-holder">
    <p class="dev-hint important">
      wenn ein neuer kontoinhaber erstellt wird und somit neue Konten, werden
      auch die Initialisierungstransaktionen erstellt, da ist die Id für die
      Category allerdings 0 diese muss beim erstellen eines neuen kontos immer
      die id von "Nicht zugewiesen" sein<br />da tritt noch ein Fehler auf
      <b>TODO</b>
    </p>
    <section class="create-account-holder-body">
      <AtomHeadline :content="'Kontoinhaber hinzufügen'" :tag="'h1'" />
      <form class="xfin-form">
        <div class="xfin-form__section">
          <div class="xfin-form__group row">
            <AtomLabel :props="{ class: 'xfin-form__label col-3', for: 'name' }" text="Name:" />

            <AtomInputText v-model="name" @blur="v$.name.$touch()"
              :props="{
                class: `xfin-form__control ${v$.name.$error ? 'has-errors' : ''}`,
                id: 'name'}" />

            <AtomParagraph text="Bitte gib einen Namen an!" :props="{ class: 'xfin-form__error' }" v-if="v$.name.required.$invalid && v$.name.$dirty" />
            <AtomParagraph text="Der Name darf nicht länger als 15 Zeichen sein!" :props="{ class: 'xfin-form__error' }"
                            v-if="v$.name.maxLength.$invalid && v$.name.$dirty" />

          </div>
        </div>
        <div class="xfin-form__section">
          <div class="xfin-form__group row">
            <label class="xfin-form__label col-3" for="account">Konto:</label>
            <label class="xfin-form__label col-4" v-if="pendingAccountCreation"
              >(Neues Konto)</label
            >
            <select
              class="xfin-form__control xfin-form__select col-4"
              v-model="selectedAccountIndex"
              @change="loadAccountData"
              v-if="bankAccounts.length && !pendingAccountCreation"
              :disabled="pendingAccountEdit"
            >
              <option
                v-for="(account, index) in bankAccounts"
                :key="index"
                :value="index"
              >
                {{ account.accountNumber }}
              </option>
            </select>
            <button
              class="xfin-form__button btn btn-primary"
              @click.prevent="toggleAccountCreation"
              v-if="!pendingAccountEdit"
            >
              {{ pendingAccountCreation ? "&times;" : "&plus;" }}
            </button>
            <p class="xfin-form__error" v-if="v$.selectedAccountIndex.$error">
              Bitte erstelle mindestens ein Konto!
            </p>
          </div>
          <div
            class="xfin-form__section account-data"
            v-if="pendingAccountCreation || bankAccounts.length"
          >
            <div class="xfin-form__group row">
              <label class="xfin-form__label col-3" for="iban">IBAN:</label>
              <input
                id="iban"
                :class="{
                  'xfin-form__control col-4': true,
                  'has-errors': v$.iban.$error,
                }"
                :disabled="!pendingAccountCreation && !pendingAccountEdit"
                type="text"
                v-model="iban"
                @blur="v$.iban.$touch"
              />
              <p class="xfin-form__error" v-if="v$.iban.$error">
                Bitte gib eine gültige IBAN an!
              </p>
            </div>
            <div class="xfin-form__group row">
              <label class="xfin-form__label col-3" for="bic">BIC:</label>
              <input
                id="bic"
                :class="{
                  'xfin-form__control col-4': true,
                  'has-errors': v$.bic.$error,
                }"
                :disabled="!pendingAccountCreation && !pendingAccountEdit"
                type="text"
                v-model="bic"
                @blur="v$.bic.$touch"
              />
              <p class="xfin-form__error" v-if="v$.bic.$error">
                Bitte gib einen gültigen BIC an!
              </p>
            </div>
            <div class="xfin-form__group row">
              <label class="xfin-form__label col-3" for="bank">Bank:</label>
              <input
                id="bank"
                :class="{
                  'xfin-form__control col-4': true,
                  'has-errors': v$.bank.$error,
                }"
                :disabled="!pendingAccountCreation && !pendingAccountEdit"
                type="text"
                v-model="bank"
                @blur="v$.bank.$touch"
                @keyup="enforceMaxLength('bank', 255)"
              />
              <p class="xfin-form__error" v-if="v$.bank.$error">
                Bitte gib eine Bank an!
              </p>
            </div>
            <div class="xfin-form__group row">
              <label class="xfin-form__label col-3" for="description"
                >Beschreibung</label
              >
              <input
                id="description"
                class="xfin-form__control col-4"
                :disabled="!pendingAccountCreation && !pendingAccountEdit"
                type="text"
                placeholder="(optional)"
                v-model="description"
                @keyup="enforceMaxLength('description', 15)"
              />
            </div>
            <div class="xfin-form__group row">
              <label class="xfin-form__label col-3" for="balance"
                >Kontostand</label
              >
              <input
                id="balance"
                :class="{
                  'xfin-form__control col-4': true,
                  'has-errors': v$.balance.$error,
                }"
                :disabled="!pendingAccountCreation && !pendingAccountEdit"
                type="text"
                v-model="balance"
                @blur="v$.balance.$touch"
              />
              <p class="xfin-form__error" v-if="v$.balance.$error">
                Bitte gib einen gültigen Konstostand an!
              </p>
            </div>
            <button
              class="xfin-form__button btn btn-primary btn-submit-account"
              @click.prevent="addAccount"
              v-if="selectedAccountIndex == -1"
            >
              Konto speichern
            </button>
            <button
              class="xfin-form__button btn btn-primary btn-edit-account"
              v-else
              @click.prevent="toggleAccountEdit"
            >
              {{ !pendingAccountEdit ? "Konto bearbeiten" : "Abbrechen" }}
            </button>
            <button
              class="xfin-form__button btn btn-primary btn-update-account"
              v-if="selectedAccountIndex != -1 && pendingAccountEdit"
              @click.prevent="updateAccount"
            >
              Änderungen speichern
            </button>
            <button
              class="xfin-form__button btn btn-primary btn-delete-account"
              title="Konto entfernen"
              v-if="selectedAccountIndex != -1 && !pendingAccountEdit"
              @click.prevent="deleteAccount"
            >
              [Trash]
            </button>
          </div>
        </div>
        <button
          class="xfin-form__button btn btn-primary btn-submit-form"
          @click.prevent="saveAccountHolder"
          :disabled="pendingAccountCreation || pendingAccountEdit"
        >
          Kontoinhaber speichern
        </button>
      </form>
    </section>
  </div>
</template>

<script>
import { useVuelidate } from "@vuelidate/core";
import { required, maxLength } from "@vuelidate/validators";

import AtomHeadline from "@/components/atoms/AtomHeadline";
import AtomInputText from "@/components/atoms/AtomInputText";
import AtomLabel from "@/components/atoms/AtomLabel";
import AtomParagraph from "@/components/atoms/AtomParagraph";

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
  components: {
    AtomHeadline,
    AtomInputText,
    AtomLabel,
    AtomParagraph,
  },

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
          balance: parseFloat(
            this.balance.replaceAll(".", "").replace(",", ".")
          ),
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
        this.description =
          this.bankAccounts[this.selectedAccountIndex].description;
        this.balance = NumberService.formatCurrency(
          this.bankAccounts[this.selectedAccountIndex].balance,
          false
        );
      }
    },

    async saveAccountHolder() {
      this.v$.$touch();

      if (!this.v$.$errors.length) {
        const newAccountHolder = await AccountHolderService.createAccountHolder(
          { name: this.name }
        );

        if (newAccountHolder) {
          for (const bankAccount of this.bankAccounts) {
            bankAccount.accountHolderId = newAccountHolder.id;

            await InternalBankAccountService.createInternalBankAccount(
              bankAccount
            );
          }

          this.$router.push("/");
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
      this.pendingAccountEdit = !this.pendingAccountEdit;

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
        bankAccount.balance = parseFloat(
          this.balance.replaceAll(".", "").replace(",", ".")
        );

        this.pendingAccountEdit = false;

        this.loadAccountData();
      }
    },

    validateAccountFields() {
      this.v$.iban.$touch();
      this.v$.bic.$touch();
      this.v$.bank.$touch();
      this.v$.balance.$touch();

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
      name: {
        required,
        maxLength: maxLength(15),
      },
      iban: { required, ibanValidator },
      bic: { required, bicValidator },
      bank: { required },
      balance: { required, balanceValidator },
      selectedAccountIndex: { dropDownValidator },
    };
  },
};
</script>