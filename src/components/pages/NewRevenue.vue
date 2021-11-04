<template>

  <div class="new-revenue">
    <section class="revenue-form-body">
      <h1>Einnahme eintragen</h1>
      <form class="xfin-account-form" v-if="categoryOptions">
        <MoleculeInputSelect  classList="new-revenue__account" :options="bankAccountOptions" field="account" v-model="selectedAccountNumber" label="Konto" />
        <MoleculeInputSelect  classList="new-revenue__category" :options="categoryOptions" field="category" v-model="selectedCategoryName" label="Kostenstelle"
                              @update:modelValue="changeCategory" />

        <div class="new-revenue__source">
          <MoleculeInputAutoSuggest classList="pb-5" field="source" :hasErrors="sourceErrors" v-model="source" :validation="v$.source" label="Quelle"
                                    :items="sourceOptions" noItemsFallback="&plus; Neu hinzufügen" :alwaysShowFallback="true" @blur="v$.source.$touch()"
                                    @itemPicked="pickItem" />

          <MoleculeInputCheckbox  v-if="showCheckbox" :classList="includeSourceAccount ? 'pb-1' : 'pb-5'" field="includeSourceAccount" v-model="includeSourceAccount"
                                  label="Bankdaten hinzufügen" :_switch="true" />

          <div v-if="includeSourceAccount" class="new-revenue__source-account pb-5">
            <MoleculeInputText  :small="true" classList="new-revenue__source-account-data pb-1" field="sourceIban" :hasErrors="newSourceIbanErrors"
                                v-model="newSourceIban" :validation="v$.newSourceIban" label="Iban" @blur="v$.newSourceIban.$touch()" />
            <MoleculeInputText  :small="true" classList="new-revenue__source-account-data pb-1" field="sourceBic" :hasErrors="newSourceBicErrors"
                                v-model="newSourceBic" :validation="v$.newSourceBic" label="Bic" @blur="v$.newSourceBic.$touch()" />
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
import { useVuelidate }                 from '@vuelidate/core';
import { revenueValidation }            from '@/validation/validations';

import { NumberService }                from '@/services/number-service';
import { AccountHolderService }         from '@/services/account-holder-service';
import { ExternalBankAccountService }   from '@/services/external-bank-account-service';
import { ExternalPartyService }         from '@/services/external-party-service';
import { InternalTransactionService }   from '@/services/internal-transaction-service';
import { ExternalTransactionService }   from '@/services/external-transaction-service';
import { TransactionCategoryService }   from '@/services/transaction-category-service.js';

import AtomButton                       from '@/components/atoms/AtomButton';
import MoleculeInputAutoSuggest         from '@/components/molecules/MoleculeInputAutoSuggest';
import MoleculeInputCheckbox            from '@/components/molecules/MoleculeInputCheckbox';
import MoleculeInputSelect              from '@/components/molecules/MoleculeInputSelect';
import MoleculeInputText                from '@/components/molecules/MoleculeInputText';

export default {
  //TODO - render form only if all API calls are finished and succeeded - currently the form is rendered when categoryOptions != null
  //TODO - so the form is still rendered, if i.e. there was an error fetching the accounts or externalParties
  async created() {
    await this.getBankAccountOptions();
    await this.getExternalParties();
    await this.getTransactionCategories();
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
    newSourceIbanErrors() { return this.v$.newSourceIban.$error },
    newSourceBicErrors() { return this.v$.newSourceBic.$error },
    showCheckbox() {
      return this.selectedSource && !this.selectedSource.id
    },
    saveDisabled() {
      return !this.includeSourceAccount
        ? this.v$.amount.$silentErrors.length > 0 || !this.selectedSource
        : this.v$.$silentErrors.length > 0;
    }
  },

  watch: {
    amount() { this.v$.amount.$touch(); },
    selectedSource() {

    },
    selectedSourceName() { this.selectedSource = this.sources.find(s => s.name === this.selectedSourceName); },
    newSource() { this.selectedSource = { name: this.newSource }; }
  },

  data() {
    return {
      accountHolders: null,
      bankAccountOptions: null,
      categories: null,
      categoryOptions: null,
      sources: null,
      sourceOptions: null,

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
    changeCategory(event) {
      this.selectedCategory = this.categories.find(c => c.name === event);
    },

    // changeSource() {
    //   this.selectedSourceBankAccountId = this.sources[this.selectedSourceIndex].externalBankAccountId;
    // },

    // findAccountId(accountNumber) {
    //   for (let i = 0; i < this.accountHolders.length; i++) {
    //     const accountHolder = this.accountHolders[i];
    //     const account = accountHolder.bankAccounts.find(b => b.accountNumber == accountNumber);

    //     if (account) {
    //       this.selectedAccountId = account.id;
    //       break;
    //     }
    //   }
    // },

    async getBankAccountOptions() {
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
            }
          });
        });
      }
      else {
        //TODO - do I need some error handling here or is it already taken care of?
      }
    },

    async getExternalParties() {
      this.sources = await ExternalPartyService.getExternalParties();
      if (!this.sources) {
        this.createNewSource = true;
      }
      else {
        // this.selectedSourceBankAccountId = this.sources[0].externalBankAccountId;

        this.sourceOptions = [];

        this.sources.forEach(source => {
          this.sourceOptions.push(source.name);
        });

        //this.sources = sourceOptions;
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
      }
      else {
        //TODO - throw error, do something
        console.log('no cats');
      }
    },

    pickItem(event) {
      if (event.target.textContent.includes('Neu hinzufügen')) {
        this.selectedSource = { name: this.source };
      }
      else {
        this.selectedSource = this.sources.find(s => s.name === event.target.textContent);
        this.source = this.selectedSource.name;
      }
    },

    async save() {
      //this.v$.newSource.$reset();
      let externalBankAccountId = null;

      if (this.createNewSource) {
        const externalParty = {
          name: this.newSource,
        };

        const createdExternalParty = await ExternalPartyService.createExternalParty(externalParty);

        if (createdExternalParty) {
          const externalBankAccount = {
            externalPartyId: createdExternalParty.id,
            iban: this.newSourceIban,
            bic: this.newSourceBic,
          };

          const createdExternalBankAccount = await ExternalBankAccountService.createExternalBankAccount(externalBankAccount);

          if (createdExternalBankAccount) {
            externalBankAccountId = createdExternalBankAccount.id;
          }
        }
      }
      else {
        //TODO - verify this - does a bankAccountId exist on selectedSource or is it called differently?
        externalBankAccountId = this.selectedSource.bankAccountId;
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

    toggleSourceCreation() {
      this.createNewSource = !this.createNewSource;
      this.unsavedSource = false;

      if (!this.createNewSource) {
        this.selectedSourceIndex = 0;
        this.newSource = '';
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