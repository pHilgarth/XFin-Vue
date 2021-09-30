<template>
  <div class="new-account-holder" :class="showForm ? 'form-active' : ''">
    <div class="new-account-holder__main">
      <p class="dev-hint important">
        wenn ein neuer kontoinhaber erstellt wird und somit neue Konten, werden
        auch die Initialisierungstransaktionen erstellt, da ist die Id für die
        Category allerdings 0 diese muss beim erstellen eines neuen kontos immer
        die id von "Nicht zugewiesen" sein<br />da tritt noch ein Fehler auf
        <b>TODO</b>
      </p>
      <AtomHeadline tag="h1" text="Kontoinhaber hinzufügen" />
      <section>
        <MoleculeInputText  classList="new-account-holder__name" field="Name" :hasErrors="hasErrors('name')" :disabled="disabled" v-model="name"
                            @blur="v$.name.$touch()" :validation="v$.name" />

        <div class="new-account-holder__accounts">
          <AtomHeadline classList="new-account-holder__accounts-headline" tag="h4" text="Konten:" />
          <AtomButtonLight classList="new-account-holder__new-account" text="&plus; Neues Konto anlegen" @click="showForm = true"/>
        </div>
      </section>
    </div>
    <div class="new-account-holder__form">
      <OrganismAccountForm v-if="showForm" />
    </div>
  </div>
</template>

<script>
import { useVuelidate } from "@vuelidate/core";
import { accountHolderValidation } from "@/validation/validations";

import AtomButtonLight from "@/components/atoms/AtomButtonLight";
import AtomHeadline from "@/components/atoms/AtomHeadline";

import MoleculeInputText from "@/components/molecules/MoleculeInputText";

import OrganismAccountForm from "@/components/organisms/OrganismAccountForm";

import { AccountHolderService } from "@/services/account-holder-service";
import { InternalBankAccountService } from "@/services/internal-bank-account-service";
import { NumberService } from "@/services/number-service.js";

export default {
  components: {
    AtomButtonLight,
    AtomHeadline,
    MoleculeInputText,
    OrganismAccountForm,
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

      showForm: false,
    };
  },

  computed: {
    disabled() {
      return !this.pendingAccountCreation && !this.pendingAccountEdit;
    },
  },

  watch: {
    name() { this.v$.name.$touch(); },
    iban() { this.v$.iban.$touch(); },
    bic() { this.v$.bic.$touch(); },
    balance() { this.v$.balance.$touch(); },
  },

  methods: {
    activateForm() {

    },

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

    hasErrors(property) {
      //property has to match a validator in this components validations function
      return this.v$[property].$error ? 'has-errors' : '';
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

  validations() { return accountHolderValidation; },

};
</script>