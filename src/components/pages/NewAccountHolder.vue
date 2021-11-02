<template>
  <div class="new-account-holder">
    <div v-if="!showForm" class="new-account-holder__main">
      <AtomHeadline tag="h1" text="Kontoinhaber hinzufügen" />
      <section>
        <MoleculeInputText  classList="new-account-holder__name" field="name" :hasErrors="nameHasErrors || duplicateName"
                            :validation="v$.name" v-model="name" label="Name" @blur="v$.name.$touch()"/>

        <teleport v-if="duplicateName" to=".new-account-holder__name">
          <AtomParagraph classList="xfin-form__error" text="Dieser Name wird bereits verwendet!"/>
        </teleport>

        <div class="new-account-holder__accounts">
          <AtomHeadline classList="new-account-holder__accounts-headline" tag="h4" text="Konten:" />
          <AtomButtonLight classList="xfin-button--light" text="&plus; Neues Konto anlegen" @click="showForm = true"/>

          <div v-if="bankAccounts.length" class="new-account-holder__account-items">
            <template v-for="(account, index) in bankAccounts" :key="index">
              <div class="new-account-holder__account">
                <AtomDelete :data-index="index" @click="deleteAccount"/>
                <span class="new-account-holder__account-number">{{ account.accountNumber }}</span>
                <AtomButtonLight classList="new-account-holder__edit xfin-button--light" :data-index="index" text="Bearbeiten" @click="editAccount" />
              </div>
            </template>
          </div>
        </div>
        <button class="xfin-button" @click="saveAccountHolder" :disabled="(v$.name.$invalid || duplicateName) || !bankAccounts.length">Kontoinhaber speichern</button>
        
      </section>
    </div>
    <div v-else class="new-account-holder__form">
      <OrganismAccountForm @cancel="showForm = false" @save="saveAccount" :formData="formData"/>
    </div>
  </div>
</template>

<script>
import { useVuelidate } from "@vuelidate/core";
import { accountHolderValidation } from '@/validation/validations';

import AtomButtonLight from "@/components/atoms/AtomButtonLight";
import AtomDelete from "@/components/atoms/AtomDelete";
import AtomHeadline from "@/components/atoms/AtomHeadline";
import AtomParagraph from '@/components/atoms/AtomParagraph';

import MoleculeInputText from "@/components/molecules/MoleculeInputText";

import OrganismAccountForm from "@/components/organisms/OrganismAccountForm";

import { AccountHolderService } from "@/services/account-holder-service";
import { InternalBankAccountService } from "@/services/internal-bank-account-service";
import { NumberService } from "@/services/number-service";

export default {
  components: {
    AtomButtonLight,
    AtomDelete,
    AtomHeadline,
    AtomParagraph,
    MoleculeInputText,
    OrganismAccountForm,
  },

  data() {
    return {
      name: "",
      bankAccounts: [],
      formData: null,

      duplicateName: false,
      loading: true,
      showForm: false,
    };
  },

  computed: {
    nameHasErrors() {
      return this.v$.name.$error;
    },
  },

  watch: {
    name() {
      this.v$.name.$touch();
      this.duplicateName = false;
    },
    showForm() {
      if (this.showForm) {
        if (!this.formData) {
          this.formData = {
            ibans: this.bankAccounts.map((b) => b.iban),
          };
        }
      } else {
        this.formData = null;
      }
    },
  },

  methods: {
    deleteAccount(event) {
      //TODO - show modal to confirm deletion
      console.log(this.bankAccounts);
      this.bankAccounts.splice(event.target.dataset.index, 1);
      console.log(this.bankAccounts);
    },

    editAccount(event) {
      this.formData = {
        account: this.bankAccounts[event.target.dataset.index],
        ibans: this.bankAccounts.map((b) => b.iban),
      };
      this.showForm = true;
    },

    saveAccount(event) {
      const newBankAccount = {
        accountNumber: NumberService.getAccountNumber(event.iban),
        iban: event.iban,
        bic: event.bic,
        bank: event.bank,
        description: event.description,
        balance: event.balance,
      };

      if (event.accountNumber) {
        this.bankAccounts[
          this.bankAccounts.findIndex(
            (b) => b.accountNumber === event.accountNumber
          )
        ] = newBankAccount;
      } else {
        this.bankAccounts.push(newBankAccount);
      }

      this.showForm = false;
    },

    async saveAccountHolder() {
      const newAccountHolder = await AccountHolderService.create({ name: this.name });

      //TODO - it's only checked, if newAccountHolder is a duplicate, not if there even is a newAccountHolder
      if (newAccountHolder.duplicate) {
        this.duplicateName = true;
      }
      else {
          for (let i = 0; i < this.bankAccounts.length; i++) {
            const bankAccount = this.bankAccounts[i];
            bankAccount.accountHolderId = newAccountHolder.id;
            bankAccount.iban = bankAccount.iban.toUpperCase();
            bankAccount.bic = bankAccount.bic.toUpperCase();
            const createdBankAccount = await InternalBankAccountService.create(bankAccount);

            if (!createdBankAccount) {
              //TODO - what if the account was created but the first account crashes? Then I have an accountHolder with no accounts.
              //In AccountView I can show only accountHolders that have accounts
              alert('error during account creation');
              break;
            }
            else {
              this.$router.push('/');
            }
          }
      }
    },
  },

  setup() {
    return { v$: useVuelidate(), };
  },

  validations() { return accountHolderValidation; },
};
</script>