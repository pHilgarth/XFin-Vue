<!-- TODO - refactor this component, its partially duplicated code with new Account Holder -->
<!-- TODO - dont render content before data is not loaded (div v-if=dataLoaded)-->
<template>
  <div class="update-account-holder">

    <div v-if="!showForm" class="update-account-holder__main">
      <AtomHeadline tag="h1" text="Kontoinhaber bearbeiten" />
      <section>
        <MoleculeInputText  classList="update-account-holder__name pb-5" field="name" :hasErrors="nameHasErrors || duplicateName"
                            :validation="v$.name" v-model="name" label="Name" @blur="v$.name.$touch()"/>

        <teleport v-if="duplicateName" to=".update-account-holder__name">
          <AtomParagraph classList="xfin-form__error" text="Dieser Name wird bereits verwendet!"/>
        </teleport>

        <div class="update-account-holder__accounts">
          <AtomHeadline classList="update-account-holder__accounts-headline" tag="h4" text="Konten:" />
          <AtomButtonLight classList="xfin-button--light" text="&plus; Neues Konto anlegen" @click="addAccount"/>

          <div v-if="updatedBankAccounts.length" class="update-account-holder__account-items">
            <template v-for="(account, index) in updatedBankAccounts" :key="index">
              <div class="update-account-holder__account">
                <AtomDelete :data-index="index" @click="deleteAccount(index)"/>
                <span class="update-account-holder__account-number">{{ account.accountNumber }}</span>
                <AtomButtonLight classList="update-account-holder__edit xfin-button--light" :data-index="index" text="Bearbeiten" @click="editAccount" />
              </div>
            </template>
          </div>
        </div>
        <button class="xfin-button" @click="saveChanges" :disabled="v$.name.$invalid || duplicateName || !updatedBankAccounts.length">
          Kontoinhaber speichern
        </button>

      </section>
    </div>
    <div v-else class="update-account-holder__form">
      <OrganismAccountForm :formData="formData" :newAccount="newAccount" @cancel="showForm = false" @save="saveAccount" :headline="formHeadline" />
    </div>
  </div>
</template>

<script>
import { useVuelidate }                   from "@vuelidate/core";
import { accountHolderValidation }        from '@/validation/validations';

import AtomButtonLight                    from "@/components/atoms/AtomButtonLight";
import AtomDelete                         from "@/components/atoms/AtomDelete";
import AtomHeadline                       from "@/components/atoms/AtomHeadline";
import AtomParagraph                      from '@/components/atoms/AtomParagraph';

import MoleculeInputText                  from "@/components/molecules/MoleculeInputText";

import OrganismAccountForm                from "@/components/organisms/OrganismAccountForm";

import { AccountHolderService }           from "@/services/account-holder-service";
import { InternalBankAccountService }     from "@/services/internal-bank-account-service";
import { InternalTransactionService }   from '@/services/internal-transaction-service';
import { NumberService }                  from "@/services/number-service";

export default {
  components: {
    AtomButtonLight,
    AtomDelete,
    AtomHeadline,
    AtomParagraph,
    MoleculeInputText,
    OrganismAccountForm,
  },

  created() {
    this.getAccountHolder();
  },

  data() {
    return {
      accountHolderId: 0,

      sourceName: '',
      name: '',
      duplicateName: false,
      nameChanged: false,

      sourceBankAccounts: [],
      updatedBankAccounts: [],
      accountsChanged: false,
      formData: null,
      fomrHeadline: null,

      loading: true,
      showForm: false,
      newAccount: false,
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

      this.nameChanged = this.name !== this.sourceName;
    },

    showForm() {
      if (this.showForm) {
        //if there is no formData, the user is creating a new account
        if (!this.formData) {
          this.formData = {
            ibans: this.updatedBankAccounts.map((b) => b.iban),
          };
          this.newAccount = true;
        }
      } else {
        this.formData = null;
        this.newAccount = false;
      }
    },
  },

  methods: {
    addAccount() {
      this.formHeadline = 'Konto hinzufügen';
      this.showForm = true;
    },

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

    deleteAccount(index) {
      const bankAccount = this.updatedBankAccounts[index];
      //TODO - implement delete on existing accounts
      if (bankAccount.id) {
        alert(`delete account (${bankAccount.id}) - not yet implemented on existing accounts!`);
      }
      else {
        this.updatedBankAccounts.splice(index, 1);
        console.log(this.updatedBankAccounts);
      }
    },

    editAccount(event) {
      this.formHeadline = 'Konto bearbeiten';
      const bankAccount = this.updatedBankAccounts[event.target.dataset.index];

      if (!bankAccount.id) {
        bankAccount.index = event.target.dataset.index;
      }

      this.formData = {
        account: bankAccount,
        ibans: this.updatedBankAccounts.map((b) => b.iban),
      };

      this.newAccount = this.sourceBankAccounts.find(b => b.id === bankAccount.id) == null;
      this.showForm = true;
    },

    async getAccountHolder() {
      const includeAccounts = true;
      const simpleBankAccounts = true;

      const accountHolder = await AccountHolderService.get(this.$route.params.id, includeAccounts, simpleBankAccounts);

      this.accountHolderId = accountHolder.id;
      this.sourceName = accountHolder.name;
      this.name = accountHolder.name;

      this.sourceBankAccounts = accountHolder.bankAccounts;
      this.updatedBankAccounts = this.copyArray(accountHolder.bankAccounts);

      this.loading = false;
    },

    saveAccount(event) {
      const bankAccount = {
        accountNumber:  NumberService.getAccountNumber(event.iban),
        id:             event.id,
        iban:           event.iban,
        bic:            event.bic,
        bank:           event.bank,
        description:    event.description,
      };

      const sourceAccount = this.sourceBankAccounts.find(b => b.id === event.id);

      //TODO - is it possible to rework this if else mess?
      //if sourceAccount => the user updated an persisted account
      if (sourceAccount) {
        bankAccount.changed = this.checkForChanges(sourceAccount, bankAccount);

        const index = this.updatedBankAccounts.findIndex(b => b.id === event.id);
        this.updatedBankAccounts[index] = bankAccount;
        //if not, he created or updated a new one
      } else {
        bankAccount.balance = event.balance;

        //if !event.accountNumber => the user created a new account - add it to updatedBankAccounts
        if (!event.index) {
          bankAccount.newAccount = true;
          this.updatedBankAccounts.push(bankAccount);
        }
        else {
          this.updatedBankAccounts[event.index] = bankAccount;
        }
      }
      this.showForm = false;
      this.accountsChanged = true;
    },

    async saveChanges() {
      if (this.nameChanged) {
        const updatedAccountHolder = await this.saveName();

        if (updatedAccountHolder.duplicate) {
          this.duplicateName = true;
          return;
        }
      }

      if (this.accountsChanged) {
        for (let i = 0; i < this.updatedBankAccounts.length; i++) {
          const bankAccount = this.updatedBankAccounts[i];
          bankAccount.iban = bankAccount.iban.toUpperCase();
          bankAccount.bic = bankAccount.bic.toUpperCase();
          const jsonPatch = [];
          if (bankAccount.id && bankAccount.changed) {
            for (const prop of bankAccount.changed) {
              jsonPatch.push({
                op: "replace",
                path: `/${prop}`,
                value: bankAccount[prop],
              });
            }

            await InternalBankAccountService.update(bankAccount.id, jsonPatch);
          }
          else if (!bankAccount.id) {

            bankAccount.accountHolderId = this.$route.params.id;
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
              const initializationTransaction = {
                internalBankAccountId: createdBankAccount.id,
                dateString: new Date().toISOString(),
                amount: bankAccount.balance,
                reference: '[Kontoinitialisierung]',
              };

              await InternalTransactionService.create(initializationTransaction);

              if (!initializationTransaction) {
                //TODO - something went wrong - throw an error?
              }
              this.$router.push('/');
            }
          }
          //if bankAccount.newAccount => it's a newly created account
        }
        // for (let i = 0; i < this.updatedBankAccounts.length; i++) {
          // const updatedBankAccount = this.updatedBankAccounts[i];
          //
          // //const createdBankAccount = await InternalBankAccountService.create(updatedBankAccount);
          //
          // if (!createdBankAccount) {
          //   //TODO - what if the account was created but the first account crashes? Then I have an accountHolder with no accounts.
          //   //In AccountView I can show only accountHolders that have accounts
          //   alert('error during account creation');
          //   break;
          // }
        // }
      }

      this.$router.push('/');
    },

    async saveName() {
      const updatedAccountHolder = {
        id: this.accountHolderId,
        name: this.name,
      };

      return await AccountHolderService.update(updatedAccountHolder);
    },
  },

  setup() {
    return { v$: useVuelidate(), };
  },

  validations() { return accountHolderValidation; },
};
</script>