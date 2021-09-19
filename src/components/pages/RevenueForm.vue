<template>
  <div class="revenue-form">
    <section class="revenue-form-body">
      <h1>Einnahme eintragen</h1>
      <!-- TODO -->
      <h2 class="dev-hint">
        start using vuetify to implement a combobox for source selection
      </h2>
      <form class="xfin-form">
        <div class="xfin-form__section">
          <div class="xfin-form__group row">
            <label class="xfin-form__label col-3" for="name">Konto:</label>
            <select class="xfin-form__control xfin-form__select col-4" v-model="selectedAccountIndex" @change="changeAccount">
              <option v-for="(option, index) in bankAccountOptions" :key="index" :value="index" :disabled="!parseInt(option.label)">
                {{ parseInt(option.label) ? `&nbsp;&nbsp;${option.label}` : option.label }}
              </option>
            </select>
          </div>
          <div class="xfin-form__group row">
            <label class="xfin-form__label col-3" for="source">Quelle:</label>
            <select id="source" class="xfin-form__control xfin-form__select col-4" v-model="selectedSourceIndex" @change="changeSource"
                    v-if="sources.length && !pendingSourceCreation">
              <option v-for="(source, index) in sources" :key="index" :value="index">
                {{ source.name }}
              </option>
            </select>
            <input v-else id="source" :class="{'xfin-form__control col-4': true,  'has-errors': v$.newSource.$error}" type="text" placeholder="(Neue Quelle)"
                    v-model="newSource" />
            <button class="xfin-form__button btn btn-primary" @click.prevent="toggleSourceCreation" v-if="sources.length">
              {{ pendingSourceCreation ? "&times;" : "&plus;" }}
            </button>
            <button class="xfin-form__button btn btn-primary" @click.prevent="saveSource" v-if="pendingSourceCreation">
              Speichern
            </button>
            <p class="xfin-form__error" v-if="(pendingSourceCreation || !sources.length) && v$.newSource.$error">
              Bitte gib eine Quelle an!
            </p>
            <p class="xfin-form__error" v-if="unsavedSource">
              Bitte speichere die Quelle!
            </p>
          </div>
        </div> 
        <div class="xfin-form__section">
          <div class="xfin-form__section account-data">
            <div class="xfin-form__group row">
              <label class="xfin-form__label col-3" for="amount">Betrag:</label>
              <input id="amount" :class="{ 'xfin-form__control col-4': true, 'has-errors': v$.amount.$error }" type="text" v-model="amount" @blur="v$.amount.$touch" />
              <p class="xfin-form__error" v-if="v$.amount.$error">
                Bitte gib einen gültigen Betrag an!
              </p>
            </div>
            <div class="xfin-form__group row">
              <label class="xfin-form__label col-3" for="reference">Verwendungszweck:</label>
              <input id="reference" :class="{'xfin-form__control col-4': true,  'has-errors': v$.reference.$error}" type="text" v-model="reference"
                      @blur="v$.reference.$touch" />
              <p class="xfin-form__error" v-if="v$.reference.$error">
                Bitte gib einen Verwendungszweck an!
              </p>
            </div>
          <div class="xfin-form__group row">
            <label class="xfin-form__label col-3" for="source">Kategorie:</label>
            <select id="category" class="xfin-form__control xfin-form__select col-4" v-model="selectedCategoryIndex" @change="changeCategory">
              <option v-for="(category, index) in categories" :key="index" :value="index">
                {{ category.name }}
              </option>
            </select>
          </div>
            <button class="xfin-form__button btn btn-primary btn-submit-revenue" @click.prevent="saveRevenue">
              Einnahme speichern
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
import { ExternalBankAccountService } from "@/services/external-bank-account-service";
import { ExternalPartyService } from "@/services/external-party-service";
import { InternalTransactionService } from "@/services/internal-transaction-service";
import { ExternalTransactionService } from "@/services/external-transaction-service";
import { TransactionCategoryService } from '@/services/transaction-category-service.js';

import { amountValidator } from "@/custom-validators/custom-validators";

export default {
  beforeMount() {
    this.getBankAccountOptions();
    this.getExternalParties();
    this.getTransactionCategories();
  },

  data() {
    return {
      amount: '',
      reference: '',

      picked: 'transfer',
      selectedAccountIndex: 1,
      selectedAccountId: null,
      selectedSourceIndex: 0,
      selectedSourceBankAccountId: null,
      selectedCategoryIndex: 0,
      selectedCategoryId: null,

      accountHolders: null,
      categories: null,
      bankAccountOptions: [],
      sources: [],
      initialSourcesLength: 0,

      pendingSourceCreation: false,
      unsavedSource: false,
      newSource: ''
    };
  },

  methods: {
    changeAccount() {
      this.selectedAccountId = this.bankAccountOptions[this.selectedAccountIndex].id;
    },

    changeCategory() {
      this.selectedCategoryId = this.categories[this.selectedCategoryIndex].id;
    },

    changeSource() {
      this.selectedSourceBankAccountId = this.sources[this.selectedSourceIndex].externalBankAccountId;
    },

    async getBankAccountOptions() {
      const includeBankAccounts = true;
      this.accountHolders = await AccountHolderService.getAccountHolders(includeBankAccounts);

      if (this.accountHolders) {
        this.accountHolders.forEach(accountHolder => {
          this.bankAccountOptions.push({
            label: accountHolder.name
          });

          accountHolder.bankAccounts.forEach(bankAccount => {
            this.bankAccountOptions.push({
              label: bankAccount.accountNumber,
              id: bankAccount.id,
            });
          });
        });

        this.selectedAccountId = this.bankAccountOptions[1].id
      }
    },

    async getExternalParties() {
      this.sources = await ExternalPartyService.getExternalParties();
      this.selectedSourceBankAccountId = this.sources[0].externalBankAccountId;

      if (this.sources.length === 0) {
        this.newSourceInputActive = true;
      }
      else {
        this.initialSourcesLength = this.sources.length;
      }
    },

    async getTransactionCategories() {
      this.categories = await TransactionCategoryService.getTransactionCategories();
      this.selectedCategoryId = this.categories[0].id;
    },

    async saveRevenue() {
      this.v$.newSource.$reset();

      if (!this.sources.length) {
        if (this.validateSourceField() & this.validateRevenueFields()) {
          const externalParty = {
            name: this.newSource
          };
          const createdExternalParty = await ExternalPartyService.createExternalParty(externalParty);

          const externalBankAccount = {
            externalPartyId: createdExternalParty.id
          };
          const createdExternalBankAccount = await ExternalBankAccountService.createExternalBankAccount(externalBankAccount);

          const externalBankAccountId = createdExternalBankAccount.id;
          const currentDate = new Date().toISOString();
          const amount = parseFloat(this.amount.replaceAll(".", "").replace(",", "."));

          const externalTransaction = {
            externalBankAccountId: externalBankAccountId,
            dateString: currentDate,
            amount: amount * -1,
            reference: this.reference
          };
          const createdExternalTransaction = await ExternalTransactionService.createExternalTransaction(externalTransaction);

          const internalTransaction = {
            internalBankAccountId: this.selectedAccountId,
            transactionCategoryId: this.selectedCategoryId,
            dateString: currentDate,
            amount: amount,
            reference: this.reference,
            counterPartTransactionToken: createdExternalTransaction.transactionToken,
            transactionToken: createdExternalTransaction.counterPartTransactionToken
          };
          await InternalTransactionService.createInternalTransaction(internalTransaction);
        }
      }
      else {
        if (this.pendingSourceCreation) {
          this.unsavedSource = true;
          this.validateRevenueFields();
        }
        else if (this.validateRevenueFields()) {
          let externalBankAccountId;

          if (this.sources.length !== this.initialSourcesLength) {
            const externalParty = {
              name: this.newSource
            };
            const createdExternalParty = await ExternalPartyService.createExternalParty(externalParty);
            
            const externalBankAccount = {
              externalPartyId: createdExternalParty.id
            };

            const createdExternalBankAccount = await ExternalBankAccountService.createExternalBankAccount(externalBankAccount);
            externalBankAccountId = createdExternalBankAccount.id;
          }
          else {
            externalBankAccountId = this.selectedSourceBankAccountId;
          }

          const currentDate = new Date().toISOString();
          const amount = parseFloat(this.amount.replaceAll(".", "").replace(",", "."));

          const externalTransaction = {
            externalBankAccountId: externalBankAccountId,
            dateString: currentDate,
            amount: amount * -1,
            reference: this.reference
          };
          const createdExternalTransaction = await ExternalTransactionService.createExternalTransaction(externalTransaction);

          const internalTransaction = {
            internalBankAccountId: this.selectedAccountId,
            transactionCategoryId: this.selectedCategoryId,
            dateString: currentDate,
            amount: amount,
            reference: this.reference,
            counterPartTransactionToken: createdExternalTransaction.transactionToken,
            transactionToken: createdExternalTransaction.counterPartTransactionToken
          };
          await InternalTransactionService.createInternalTransaction(internalTransaction);
        }
      }
    },

  saveSource() {
    this.unsavedSource = false;
    if (this.validateSourceField()) {
      if (this.sources.length > this.initialSourcesLength) {
        this.sources.pop();
      }

      this.sources.push({
        id: -1,
        name: this.newSource
      });
      
      this.unsavedSource = false;

      this.pendingSourceCreation = false;
      this.selectedSourceIndex = this.sources.length - 1;
    }
  },

    toggleSourceCreation() {
      this.pendingSourceCreation = !this.pendingSourceCreation;
      this.unsavedSource = false;

      if (!this.pendingSourceCreation) {
        this.selectedSourceIndex = 0;
        this.newSource = '';
      }
    },

    validateRevenueFields() {
      this.v$.amount.$touch();
      this.v$.reference.$touch();

      if (!this.v$.amount.$errors.length && !this.v$.reference.$errors.length) {
        return true;
      }
    },

    validateSourceField() {
      this.v$.newSource.$touch();

      if (!this.v$.newSource.$errors.length) {
        return true;
      }
    }
  },

  setup() {
    return {
      v$: useVuelidate(),
    };
  },

  validations() {
    return {
      amount: { required, amountValidator },
      reference: { required },
      newSource: { required }
    };
  },
};
</script>