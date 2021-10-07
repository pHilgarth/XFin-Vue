<template>
  <div class="expense-form">
    <section class="expense-form-body">
      <h1>Ausgabe eintragen</h1>
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
            <label class="xfin-form__label col-3" for="target">Empfänger:</label>
            <select id="target" class="xfin-form__control xfin-form__select col-4" v-model="selectedTargetIndex" @change="changeTarget"
                    v-if="targets.length && !pendingTargetCreation">
              <option v-for="(target, index) in targets" :key="index" :value="index">
                {{ target.name }}
              </option>
            </select>
            <input v-else id="target" :class="{'xfin-form__control col-4': true,  'has-errors': v$.newTarget.$error}" type="text" placeholder="(Neuer Empfänger)"
                    v-model="newTarget" />
            <button class="xfin-form__button btn btn-primary" @click.prevent="toggleTargetCreation" v-if="targets.length">
              {{ pendingTargetCreation ? "&times;" : "&plus;" }}
            </button>
            <button class="xfin-form__button btn btn-primary" @click.prevent="saveTarget" v-if="pendingTargetCreation">
              Speichern
            </button>
            <p class="xfin-form__error" v-if="(pendingTargetCreation || !targets.length) && v$.newTarget.$error">
              Bitte gib einen Empfänger an!
            </p>
            <p class="xfin-form__error" v-if="unsavedTarget">
              Bitte speichere den Empfänger!
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
            <label class="xfin-form__label col-3" for="target">Kategorie:</label>
            <select id="category" class="xfin-form__control xfin-form__select col-4" v-model="selectedCategoryIndex" @change="changeCategory">
              <option v-for="(category, index) in categories" :key="index" :value="index">
                {{ category.name }}
              </option>
            </select>
          </div>
            <button class="xfin-form__button btn btn-primary btn-submit-expense" @click.prevent="saveExpense">
              Ausgabe speichern
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

import { NumberService} from '@/services/number-service';

import { AccountHolderService } from "@/services/account-holder-service";
import { ExternalBankAccountService } from "@/services/external-bank-account-service";
import { ExternalPartyService } from "@/services/external-party-service";
import { InternalTransactionService } from "@/services/internal-transaction-service";
import { ExternalTransactionService } from "@/services/external-transaction-service";
import { TransactionCategoryService } from '@/services/transaction-category-service.js';

import { amountValidator } from "@/validation/custom-validators";

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
      selectedTargetIndex: 0,
      selectedTargetBankAccountId: null,
      selectedCategoryIndex: 0,
      selectedCategoryId: null,

      accountHolders: null,
      categories: null,
      bankAccountOptions: [],
      targets: [],
      initialTargetsLength: 0,

      pendingTargetCreation: false,
      unsavedTarget: false,
      newTarget: ''
    };
  },

  methods: {
    changeAccount() {
      this.selectedAccountId = this.bankAccountOptions[this.selectedAccountIndex].id;
    },

    changeCategory() {
      this.selectedCategoryId = this.categories[this.selectedCategoryIndex].id;
    },

    changeTarget() {
      this.selectedTargetBankAccountId = this.targets[this.selectedTargetIndex].externalBankAccountId;
    },

    async getBankAccountOptions() {
      const includeBankAccounts = true;
      this.accountHolders = await AccountHolderService.getAll(includeBankAccounts);

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
      this.targets = await ExternalPartyService.getExternalParties();
      this.selectedTargetBankAccountId = this.targets[0].externalBankAccountId;

      if (this.targets.length === 0) {
        this.newTargetInputActive = true;
      }
      else {
        this.initialTargetsLength = this.targets.length;
      }
    },

    async getTransactionCategories() {
      this.categories = await TransactionCategoryService.getTransactionCategories();
      this.selectedCategoryId = this.categories[0].id;
    },

    async saveExpense() {
      this.v$.newTarget.$reset();

      if (!this.targets.length) {
        if (this.validateTargetField() & this.validateExpenseFields()) {
          const externalParty = {
            name: this.newTarget
          };
          const createdExternalParty = await ExternalPartyService.createExternalParty(externalParty);

          const externalBankAccount = {
            externalPartyId: createdExternalParty.id
          };
          const createdExternalBankAccount = await ExternalBankAccountService.createExternalBankAccount(externalBankAccount);

          const externalBankAccountId = createdExternalBankAccount.id;
          const currentDate = new Date().toISOString();
          const amount = NumberService.parseFloat(this.amount);

          const externalTransaction = {
            externalBankAccountId: externalBankAccountId,
            dateString: currentDate,
            amount: amount,
            reference: this.reference
          };
          const createdExternalTransaction = await ExternalTransactionService.createExternalTransaction(externalTransaction);

          const internalTransaction = {
            internalBankAccountId: this.selectedAccountId,
            transactionCategoryId: this.selectedCategoryId,
            dateString: currentDate,
            amount: amount * -1,
            reference: this.reference,
            counterPartTransactionToken: createdExternalTransaction.transactionToken,
            transactionToken: createdExternalTransaction.counterPartTransactionToken
          };
          await InternalTransactionService.create(internalTransaction);
        }
      }
      else {
        if (this.pendingTargetCreation) {
          this.unsavedTarget = true;
          this.validateExpenseFields();
        }
        else if (this.validateExpenseFields()) {
          let externalBankAccountId;

          if (this.targets.length !== this.initialTargetsLength) {
            const externalParty = {
              name: this.newTarget
            };
            const createdExternalParty = await ExternalPartyService.createExternalParty(externalParty);
            
            const externalBankAccount = {
              externalPartyId: createdExternalParty.id
            };

            const createdExternalBankAccount = await ExternalBankAccountService.createExternalBankAccount(externalBankAccount);
            externalBankAccountId = createdExternalBankAccount.id;
          }
          else {
            externalBankAccountId = this.selectedTargetBankAccountId;
          }

          const currentDate = new Date().toISOString();
          const amount = NumberService.parseFloat(this.amount);

          const externalTransaction = {
            externalBankAccountId: externalBankAccountId,
            dateString: currentDate,
            amount: amount ,
            reference: this.reference
          };
          const createdExternalTransaction = await ExternalTransactionService.createExternalTransaction(externalTransaction);

          const internalTransaction = {
            internalBankAccountId: this.selectedAccountId,
            transactionCategoryId: this.selectedCategoryId,
            dateString: currentDate,
            amount: amount * -1,
            reference: this.reference,
            counterPartTransactionToken: createdExternalTransaction.transactionToken,
            transactionToken: createdExternalTransaction.counterPartTransactionToken
          };
          await InternalTransactionService.create(internalTransaction);
        }
      }
    },

  saveTarget() {
    this.unsavedTarget = false;
    if (this.validateTargetField()) {
      if (this.targets.length > this.initialTargetsLength) {
        this.targets.pop();
      }

      this.targets.push({
        id: -1,
        name: this.newTarget
      });
      
      this.unsavedTarget = false;

      this.pendingTargetCreation = false;
      this.selectedTargetIndex = this.targets.length - 1;
    }
  },

    toggleTargetCreation() {
      this.pendingTargetCreation = !this.pendingTargetCreation;
      this.unsavedTarget = false;

      if (!this.pendingTargetCreation) {
        this.selectedTargetIndex = 0;
        this.newTarget = '';
      }
    },

    validateExpenseFields() {
      this.v$.amount.$touch();
      this.v$.reference.$touch();

      if (!this.v$.amount.$errors.length && !this.v$.reference.$errors.length) {
        return true;
      }
    },

    validateTargetField() {
      this.v$.newTarget.$touch();

      if (!this.v$.newTarget.$errors.length) {
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
      newTarget: { required }
    };
  },
};
</script>