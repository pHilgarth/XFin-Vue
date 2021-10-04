<template>
  <div class="new-account-holder">
    <MoleculeLoading v-if="loading || !accountHolders" :loadingError="!loading && !accountHolders" />
    <div v-else-if="!showForm" class="new-account-holder__main">
      <p class="dev-hint important">
        wenn ein neuer kontoinhaber erstellt wird und somit neue Konten, werden
        auch die Initialisierungstransaktionen erstellt, da ist die Id für die
        Category allerdings 0 diese muss beim erstellen eines neuen kontos immer
        die id von "Nicht zugewiesen" sein<br />da tritt noch ein Fehler auf
        <b>TODO</b>
      </p>
      <p class="dev-hint important">doppelte IBAN verhindern -> serverseitig testen</p>
      <p class="dev-hint important" >doppelte Namen verhindern! (serverseitig prüfen)</p><h4>{{ v$ }}</h4>
      <AtomHeadline tag="h1" text="Kontoinhaber hinzufügen" /><h2>{{ accountHolders }}</h2>
      <section>
        <MoleculeInputText  classList="new-account-holder__name" field="Name" :hasErrors="nameHasErrors" v-model="name" @blur="v$.name.$touch()"
                            :validation="v$.name" />

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
      </section>
    </div>
    <div v-else class="new-account-holder__form">
      <OrganismAccountForm @cancel="showForm = false" @save="saveAccount" :formData="formData"/>
    </div>
  </div>
</template>

<script>
import { useVuelidate } from "@vuelidate/core";
//import { required, maxLength } from "@vuelidate/validators";
import { accountHolderValidation } from '@/validation/validations';
import { nameDuplicateValidator } from '@/validation/custom-validators';


import AtomButtonLight from "@/components/atoms/AtomButtonLight";
import AtomDelete from "@/components/atoms/AtomDelete";
import AtomHeadline from "@/components/atoms/AtomHeadline";

import MoleculeInputText from "@/components/molecules/MoleculeInputText";
import MoleculeLoading from "@/components/molecules/MoleculeLoading";

import OrganismAccountForm from "@/components/organisms/OrganismAccountForm";

import { AccountHolderService } from "@/services/account-holder-service";
//import { InternalBankAccountService } from "@/services/internal-bank-account-service";
import { NumberService } from "@/services/number-service.js";

export default {

  created() {
    console.log('created');
    this.getAccountHolders();
  },

  components: {
    AtomButtonLight,
    AtomDelete,
    AtomHeadline,
    MoleculeInputText,
    MoleculeLoading,
    OrganismAccountForm,
  },

  data() {
    return {
      name: "",
      bankAccounts: [],
      formData: null,
      accountHolders: null,

      validationTest: accountHolderValidation,

      loading: true,
      showForm: false,
    };
  },

  computed: {
    nameHasErrors() {
      return this.v$.name.$error ? "has-errors" : "";
    },
  },

  watch: {
    name() {
      this.v$.name.$touch();
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

    async getAccountHolders(includeAccounts = false) {
      this.accountHolders = await AccountHolderService.getAccountHolders(includeAccounts);
      
      if (this.accountHolders.length) {
        this.validationTest.name.nameDuplicate = nameDuplicateValidator(this.accountHolders.map(a => a.name));
      }
      this.loading = false;
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
    // async saveAccountHolder() {
    //   this.v$.$touch();
    //   if (!this.v$.$errors.length) {
    //     const newAccountHolder = await AccountHolderService.createAccountHolder(
    //       { name: this.name }
    //     );
    //     if (newAccountHolder) {
    //       for (const bankAccount of this.bankAccounts) {
    //         bankAccount.accountHolderId = newAccountHolder.id;
    //         await InternalBankAccountService.createInternalBankAccount(
    //           bankAccount
    //         );
    //       }
    //       this.$router.push("/");
    //     }
    //   }
    // },
  },

  setup() {
    return { v$: useVuelidate(), };
  },

  validations() { return this.validationTest;
    // return {
    //   name: {
    //     required,
    //     maxLength: maxLength(15),
    //     nameDuplicate: nameDuplicateValidator(this.accountHolders.map(a => a.name)),
    //   },
    // };
  },
};
</script>