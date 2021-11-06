<template>

  <div class="new-revenue">
    <section class="revenue-form-body">
      <h1>Einnahme eintragen</h1>
      <form class="xfin-account-form" v-if="categoryOptions">
        <MoleculeInputSelect  classList="new-revenue__account" :options="bankAccountOptions" field="account" v-model="selectedAccountNumber" label="Konto" />
        <MoleculeInputSelect  classList="new-revenue__category" :options="categoryOptions" field="category" v-model="selectedCategoryName" label="Kostenstelle"
                              @update:modelValue="selectedCategory = categories.find(c => c.name === $event)" />

        <div class="new-revenue__source">
          <MoleculeInputAutoSuggest :classList="paddingAutoSuggest" field="source" :hasErrors="sourceErrors" v-model="source" :validation="v$.source" label="Quelle"
                                    :items="sourceNames" noItemsFallback="&plus; Neu hinzufügen" :alwaysShowFallback="true" @blur="blurAutoSuggest"
                                    @itemPicked="pickItem" />

          <MoleculeInputCheckbox  v-if="showCheckbox" :classList="includeSourceAccount ? 'pb-1' : 'pb-5'" field="includeSourceAccount"
                                  v-model="includeSourceAccount" label="Bankdaten hinzufügen" :_switch="true" />

          <div v-if="includeSourceAccount" class="new-revenue__source-account pb-5">
            <MoleculeInputText  :small="true" classList="new-revenue__source-account-data pb-1" field="sourceIban" :hasErrors="sourceIbanErrors"
                                v-model="sourceIban" :validation="v$.sourceIban" label="Iban" @blur="v$.sourceIban.$touch()" />
            <MoleculeInputText  :small="true" classList="new-revenue__source-account-data pb-1" field="sourceBic" :hasErrors="sourceBicErrors"
                                v-model="sourceBic" :validation="v$.sourceBic" label="Bic" @blur="v$.sourceBic.$touch()" />
          </div>
        </div>

        <MoleculeInputText classList="pb-5" field="reference" v-model="reference" :optional="true" label="Verwendungszweck" />
        <!-- TODO - adjust validation regex! users are forced to type in a 100% valid amount. Just "10" is not possible, but thats bad UX -->
        <MoleculeInputText  classList="pb-5" field="amount" :hasErrors="amountErrors" v-model="amount" :validation="v$.amount" label="Betrag"
                            @blur="v$.amount.$touch()" />

       <AtomButton classList="xfin-form__button" text="Speichern" :disabled="saveDisabled" @click.prevent="save" />
       <p>{{ source || 'null or empty' }}</p>
       <p>{{ selectedSource || 'null or empty' }}</p>
      </form>
    </section>
  </div>
</template>

<script>
//TODO - refactor every component to use the same import structure: 1. third-party-libs 2. my components 3. my services
import { useVuelidate }                 from '@vuelidate/core';
import { revenueValidation }            from '@/validation/validations';

import AtomButton                       from '@/components/atoms/AtomButton';
import MoleculeInputAutoSuggest         from '@/components/molecules/MoleculeInputAutoSuggest';
import MoleculeInputCheckbox            from '@/components/molecules/MoleculeInputCheckbox';
import MoleculeInputSelect              from '@/components/molecules/MoleculeInputSelect';
import MoleculeInputText                from '@/components/molecules/MoleculeInputText';

import { NumberService }                from '@/services/number-service';
import { AccountHolderService }         from '@/services/account-holder-service';
import { ExternalBankAccountService }   from '@/services/external-bank-account-service';
import { ExternalPartyService }         from '@/services/external-party-service';
import { InternalTransactionService }   from '@/services/internal-transaction-service';
import { ExternalTransactionService }   from '@/services/external-transaction-service';
import { TransactionCategoryService }   from '@/services/transaction-category-service.js';

export default {
  //TODO - maybe tweak this error handling?
  async created() {
    let result = null;
    result = await this.getAccountHolders();

    if (result.success) {
      result = await this.getExternalParties();
    }
    else {
      console.error(result.error);
    }

    if (result.success) {
      result = await this.getTransactionCategories();
    }
    else {
      console.error(result.error);
    }

    if (!result.success) {
      console.error(result.error);
    }
  },

  components: {
    AtomButton,
    MoleculeInputAutoSuggest,
    MoleculeInputCheckbox,
    MoleculeInputSelect,
    MoleculeInputText,
  },

  computed: {
    amountErrors() { return this.v$.amount.$error },
    sourceErrors() { return this.v$.source.$error },
    sourceIbanErrors() { return this.v$.sourceIban.$error },
    sourceBicErrors() { return this.v$.sourceBic.$error },

    paddingAutoSuggest() {
      return this.selectedSource && !this.selectedSource.id
        ? 'pb-1'
        : 'pb-5';
    },

    saveDisabled() {
      return !this.includeSourceAccount
        ? this.v$.amount.$silentErrors.length > 0 || !this.selectedSource
        : this.v$.$silentErrors.length > 0 || !this.selectedSource;
    },

    showCheckbox() {
      return this.selectedSource && !this.selectedSource.id
    },
  },

  watch: {
    amount() { this.v$.amount.$touch(); },
    sourceBic() { this.v$.sourceBic.$touch(); },
    sourceIban() { this.v$.sourceIban.$touch(); },

    source() {
      if (!this.sources.find(s => s.name === this.source)) {
        this.selectedSource = null;
      }
    },
  },

  data() {
    return {
      accountHolders: null,
      bankAccountOptions: null,
      categories: null,
      categoryOptions: null,
      sources: null,
      sourceNames: [],

      selectedAccountNumber: null,
      selectedAccount: null,
      selectedCategoryName: null,
      selectedCategory: null,

      //source is the v-model property for the input field - it refers to a sources name and is of type string
      source: null,
      //selectedSource is the actual sourceObject which contains the id and the externalBankAccountId if it's a persisted source
      selectedSource: null,
      reference: '',
      amount: '',

      includeSourceAccount: false,
      sourceIban: null,
      sourceBic: null,
    };
  },

  methods: {
    blurAutoSuggest() {
      if (!this.selectedSource) {
        this.source = '';
      }

      this.v$.source.$touch();
    },

    async getAccountHolders() {
      const includeBankAccounts = true;
      this.accountHolders = await AccountHolderService.getAll(includeBankAccounts);

      if (this.accountHolders) {
        this.bankAccountOptions = [];

        this.accountHolders.forEach(accountHolder => {
          this.bankAccountOptions.push({
            value: accountHolder.name,
            disabled: true,
          });

          accountHolder.bankAccounts.forEach(bankAccount => {
            this.bankAccountOptions.push({
              value: bankAccount.accountNumber,
              disabled: false,
            });

            //select the account which matches the id in the url
            if (bankAccount.id == this.$route.params.id) {
              this.selectedAccountNumber = bankAccount.accountNumber;
              this.selectedAccount = bankAccount;
            }
          });
        });

        return {
          success: true,
          error: null,
        };
      }
      else {
        return {
          success: false,
          error: 'Error fetching accountHolders',
        };
      }
    },

    async getExternalParties() {
      this.sources = await ExternalPartyService.getExternalParties();
      if (this.sources) {
        this.sources.forEach(source => {
          this.sourceNames.push(source.name);
        });

        return {
          success: true,
          error: null,
        };
      }
      else {
        return {
          success: false,
          error: 'Error fetching externalParties',
        };
      }
    },

    async getTransactionCategories() {
      this.categories = await TransactionCategoryService.getTransactionCategories();

      if (this.categories) {
        this.categoryOptions = [];

        this.categories.forEach(category => {
          this.categoryOptions.push({
            value: category.name,
            disabled: false,
          });
        });

        this.selectedCategoryName = this.categories[0].name;
        this.selectedCategory = this.categories[0];

        return {
          success: true,
          error: null,
        };
      }
      else {
        return {
          success: false,
          error: 'Error fetching transactionCategories',
        };
      }
    },

    pickItem(event) {
      //highlighting the match is realized by wrapping it in a <strong>-element, if the user clicks that part, we get the complete string from parentNode
      const clickedItem = event.target.tagName.toLowerCase() === 'strong'
        ? event.target.parentNode.innerText
        : event.target.textContent;

      if (clickedItem.includes('Neu hinzufügen')) {
        this.selectedSource = { name: this.source.trim() };
      }
      else {
        this.selectedSource = this.sources.find(s => s.name === clickedItem);
        this.source = this.selectedSource.name;
      }
    },

    //TODO - refactor this method, split it up into multiple async functions
    async save() {
      let externalBankAccountId = null;

      if (!this.selectedSource.id) {
        const externalParty = {
          name: this.source,
        };

        const createdExternalParty = await ExternalPartyService.createExternalParty(externalParty);

        if (createdExternalParty) {
          const externalBankAccount = {
            externalPartyId: createdExternalParty.id,
            iban: this.sourceIban?.toUpperCase(),
            bic: this.sourceBic?.toUpperCase(),
          };

          const createdExternalBankAccount = await ExternalBankAccountService.createExternalBankAccount(externalBankAccount);

          if (createdExternalBankAccount) {

            externalBankAccountId = createdExternalBankAccount.id;
          }
          else {
            //TODO - error handling?
          }
        }
        else {
            //TODO - error handling?
        }
      }
      else {
        externalBankAccountId = this.selectedSource.externalBankAccount.id;
      }

      const currentDate = new Date().toISOString();
      const amount = NumberService.parseFloat(this.amount);

      const externalTransaction = {
        externalBankAccountId: externalBankAccountId,
        dateString: currentDate,
        amount: amount * -1,
        reference: this.reference
      };
      const createdExternalTransaction = await ExternalTransactionService.createExternalTransaction(externalTransaction);
      
      if (!createdExternalTransaction) {
        //TODO - something went wrong - throw an error?
      }
      else {
        const internalTransaction = {
          internalBankAccountId: this.selectedAccount.id,
          transactionCategoryId: this.selectedCategory.id,
          dateString: currentDate,
          amount: amount,
          reference: this.reference,
          counterPartTransactionToken: createdExternalTransaction.transactionToken,
          transactionToken: createdExternalTransaction.counterPartTransactionToken
        };
        await InternalTransactionService.create(internalTransaction);

        if (!internalTransaction) {
          //TODO - something went wrong - throw an error?
        }
      }
    },
  },

  setup() {
    return {
      v$: useVuelidate(),
    };
  },

  validations() { return revenueValidation; },
};
</script>