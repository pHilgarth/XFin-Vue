<template>
  <div class="new-account-holder">
    <div v-if="!showForm" class="new-account-holder__main">
      <p class="dev-hint important">
        wenn ein neuer kontoinhaber erstellt wird und somit neue Konten, werden
        auch die Initialisierungstransaktionen erstellt, da ist die Id für die
        Category allerdings 0 diese muss beim erstellen eines neuen kontos immer
        die id von "Nicht zugewiesen" sein<br />da tritt noch ein Fehler auf
        <b>TODO</b>
      </p>
      <p class="dev-hint important">doppelte IBANS verhindern => serverseitig muss noch getestet werden, ob die Konten bereits bei anderen AccHolders bereits existieren</p>
      <AtomHeadline tag="h1" text="Kontoinhaber hinzufügen" />
      <section>
        <MoleculeInputText  classList="new-account-holder__name" field="Name" :hasErrors="nameHasErrors || duplicateName"
                            :validation="v$.name" v-model="name" @blur="v$.name.$touch()"/>

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
                <p class="new-account-holder__duplicate-account xfin-form__error" v-if="duplicateAccount?.index === index">
                  Dieses Konto existiert bereits!
                </p>
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
      duplicateAccount: null,
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

      if (newAccountHolder.duplicate) {
        this.duplicateName = true;
      }
      else {
          for (let i = 0; i < this.bankAccounts.length; i++) {
            const bankAccount = this.bankAccounts[i];
            bankAccount.accountHolderId = newAccountHolder.id;
            const createdBankAccount = await InternalBankAccountService.create(bankAccount);

            if (createdBankAccount.duplicate) {
              console.log(i);
              this.duplicateAccount = { index: i };
              console.log(this.duplicateAccount);
              break;
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