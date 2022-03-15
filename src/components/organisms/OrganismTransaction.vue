<!-- TODO on new expense: check the available amount on the selected account and category -->
<!-- TODO the available amount is infinite, if the user didnt set any settings -->
<!-- TODO the user can configure the accounts so its not possible to spend more money than to an certain balance (gesperrtes Budget und so, nicht ins minus)-->
<template>
  <div class="transaction">
    <section class="transaction-body">
      <h1>{{ transactionType === 'revenue' ? 'Einnahme' : 'Ausgabe' }} eintragen</h1>
      <MoleculeLoading v-if="!dataLoaded" :loadingError="loadingError" errorMessage="Fehler beim Laden der Daten!"/>

      <form class="xfin-account-form" v-else>
        <MoleculeInputSelect  classList="transaction__account" :options="bankAccountOptions" field="account" v-model="selectedAccountNumber" label="Konto" />
        <MoleculeInputSelect  classList="transaction__category" :options="categoryOptions" field="category" v-model="selectedCategoryName" label="Kostenstelle"
                              @update:modelValue="selectedCategory = categories.find(c => c.name === $event)" />

        <div class="transaction__counter-part">
          <MoleculeInputAutoSuggest :classList="paddingAutoSuggest" field="counter-part" :hasErrors="counterPartErrors" v-model="counterPart"
                                    :validation="v$.counterPart" :label="`${transactionType === 'revenue' ? 'Zahlungspflichtiger' : 'Zahlungsempfänger'}`"
                                    :items="counterPartNames" noItemsFallback="&plus; Neu hinzufügen"
                                    :alwaysShowFallback="true" :errorMessageParams="{ counterPartType: transactionType === 'revenue' ? 'Zahlungspflichtigen' : 'Zahlungsempfänger' }"
                                    @blur="blurAutoSuggest" @itemPicked="pickItem" />

          <MoleculeInputCheckbox  v-if="showCheckbox" :classList="includeCounterPartAccount ? 'pb-1' : 'pb-5'" field="include-counter-part-account"
                                  v-model="includeCounterPartAccount" label="Bankdaten hinzufügen" :_switch="true" />

          <div v-if="includeCounterPartAccount" class="transaction__counter-part-account pb-5">
            <MoleculeInputText  :small="true" classList="transaction__counter-part-account-data pb-1" field="counter-part-iban"
                                :hasErrors="counterPartIbanErrors" v-model="counterPartIban" :validation="v$.counterPartIban" label="Iban"
                                @blur="v$.counterPartIban.$touch()" />
            
            <MoleculeInputText  :small="true" classList="transaction__counter-part-account-data pb-1" field="counter-part-bic" :hasErrors="counterPartBicErrors"
                                v-model="counterPartBic" :validation="v$.counterPartBic" label="Bic" @blur="v$.counterPartBic.$touch()" />
          </div>
        </div>

        <MoleculeInputText classList="pb-5" field="reference" v-model="reference" :optional="true" label="Verwendungszweck" />
        <!-- TODO - den verfügbaren Betrag immer anzeigen lassen! (heute verfügbar, wie im OnlineBanking) -->
        <MoleculeInputText field="amount" :hasErrors="amountErrors" v-model="amount" :validation="v$.amount" label="Betrag" :errorMessageParams="{ limitType: availableAmountLimitType }"
                           @blur="v$.amount.$touch()" />

       <AtomButton text="Speichern" :disabled="saveDisabled" @click.prevent="save" />
       <p>{{ selectedCategory }}</p>
      </form>
    </section>
  </div>
</template>

<script>
//TODO - i need to refactor this component, its crap. I had to place counterPartAccountData into its own child component for the client side iban duplicate check
//TODO - because of async created() i dont knwow how to add the ibanDuplicateValidator or pass the ibans to it - the current way of doing this is ugly as fuck
//TODO - watch the course on async programming on pluralsight!! There must be a way to realize this

//TODO - when no reference is provided, it should be NULL in db not ''

//TODO - refactor every component to use the same import structure: 1. third-party-libs 2. my components 3. my services
import { useVuelidate } from "@vuelidate/core";

import AtomButton from "@/components/atoms/AtomButton";
import MoleculeInputAutoSuggest from "@/components/molecules/MoleculeInputAutoSuggest";
import MoleculeInputCheckbox from "@/components/molecules/MoleculeInputCheckbox";
import MoleculeInputSelect from "@/components/molecules/MoleculeInputSelect";
import MoleculeInputText from "@/components/molecules/MoleculeInputText";
import MoleculeLoading from '@/components/molecules/MoleculeLoading';

import { NumberService } from "@/services/number-service";
import { AccountHolderService } from "@/services/account-holder-service";
import { ExternalBankAccountService } from "@/services/external-bank-account-service";
import { ExternalPartyService } from "@/services/external-party-service";
import { InternalTransactionService } from "@/services/internal-transaction-service";
import { ExternalTransactionService } from "@/services/external-transaction-service";
import { CostCenterService } from "@/services/cost-center-service.js";

import { amountAvailableValidator, counterPartValidator } from '@/validation/custom-validators';
//import { counterPartValidator } from '@/validation/custom-validators';

import {
  amountValidator,
  bicValidator,
  ibanDuplicateValidator,
  ibanValidator,
} from "@/validation/custom-validators";

export default {
  //TODO - tweak this error handling -  it is so ugly
  async created() {
    let apiResponse = await this.getAccountHolders();

    if (apiResponse.success) {
      apiResponse = await this.getExternalParties();

      if (apiResponse.success) {
        apiResponse = await this.getTransactionCategories();

        if (apiResponse.success) {
          this.dataLoaded = true;
        } else {
          this.loadingError = true;
          console.error(apiResponse.error);
        }
      } else {
        this.loadingError = true;
        console.error(apiResponse.error);
      }
    } else {
      this.loadingError = true;
      console.error(apiResponse.error);
    }
  },

  components: {
    AtomButton,
    MoleculeInputAutoSuggest,
    MoleculeInputCheckbox,
    MoleculeInputSelect,
    MoleculeInputText,
    MoleculeLoading,
  },

  props: {
    transactionType: { type: String, required: true },
  },

  computed: {
    amountErrors() { return this.v$.amount.$error; },
    counterPartBicErrors() { return this.v$.counterPartBic.$error; },
    counterPartErrors() { return this.v$.counterPart.$error; },
    counterPartIbanErrors() { return this.v$.counterPartIban.$error; },
    showCheckbox() { return this.selectedCounterPart && !this.selectedCounterPart.id; },

    paddingAutoSuggest() {
      return this.selectedCounterPart && !this.selectedCounterPart.id
        ? "pb-1"
        : "pb-5";
    },

    saveDisabled() {
      return !this.includeCounterPartAccount
        ? this.v$.amount.$silentErrors.length > 0 || !this.selectedCounterPart
        : this.v$.$silentErrors.length > 0 || !this.selectedCounterPart;
    },
  },

  watch: {
    amount() { this.v$.amount.$touch(); },

    counterPart() {
      if (!this.counterParts.find((c) => c.name === this.counterPart)) {
        this.selectedCounterPart = null;
      }
    },

    counterPartBic() {
      this.counterPartBic = this.counterPartBic.toUpperCase();
      this.v$.counterPartBic.$touch();
    },

    counterPartIban() {
      this.counterPartIban = this.counterPartIban.toUpperCase();
      this.v$.counterPartIban.$touch();
    },

    includeCounterPartAccount() {
      this.ibans = this.ibans === null
        ? Array.from([
              this.accountHolders.map((a) => a.bankAccounts.map((b) => b.iban)).flat(),
            ...this.counterParts.map((c) => c.externalBankAccount.iban),
          ]).flat().filter((i) => i !== null)
        : this.ibans;
    },

    selectedAccountNumber() {
      this.findAccount();
      this.$router.push(`/new-${this.transactionType}/${this.selectedAccount.id}`);
    },
  },

  data() {
    return {
      dataLoaded: false,
      loadingError: false,

      ibans: null,

      accountHolders: null,
      bankAccountOptions: null,
      categories: null,
      categoryOptions: null,
      counterParts: null,
      counterPartNames: [],

      availableAmount: null,
      availableAmountLimitType: null,
      selectedAccountNumber: null,
      selectedAccount: null,
      selectedCategoryName: null,
      selectedCategory: null,

      //counterPart is the v-model property for the input field - it refers to a counterParts name and is of type string
      counterPart: null,
      //selectedCounterPart is the actual counterPartObject which contains the id and the externalBankAccountId if it's a counterPart stored in db
      selectedCounterPart: null,
      reference: "",
      amount: "",

      includeCounterPartAccount: false,
      counterPartIban: null,
      counterPartBic: null,
    };
  },

  methods: {
    blurAutoSuggest() {
      if (!this.selectedCounterPart) {
        this.counterPart = "";
      }

      this.v$.counterPart.$touch();
    },

    //TODO - wenn Konto überzogen werden darf, kann auch jede KS überzogen werden
    //TODO - wenn Konto überzogen werden darf, beim Überziehen einer KS eine Warnung ausgeben
    //TODO - wenn Konto überzogen werden darf, bei KS mit gesperrtem Budget eine Warnung ausgeben, wenn dieses gesperrte Budget "angerührt" wird (weil zu hohe Ausgabe)
    //TODO - wenn Konto nicht überzogen werden darf, darf auch keine einzige KS überzogen werden
    //TODO - wenn Konto nicht überzogen werden darf, beim Überziehen einer KS einen Validation-Fehler ausgeben
    //TODO - wenn Konto nicht überzogen werden darf, bei KS mit gesperrtem Budget einen Validation-Fehler ausgeben, wenn dieses gesperrte Budget "angerührt" wird (weil zu hohe Ausgabe)
    calculateAvailableAmount(bankAccount, transactionCategory) {
      const balance = bankAccount.balance;
      const expensesSum = bankAccount.expenses.length > 0
          ? Math.abs(bankAccount.expenses.map(e => e.amount).reduce((a,b) => a + b))
          : 0;

      const settings = bankAccount.accountSettings;

      //calculate availableAmount based on the balance and balanceThreshold
      let availableBalanceAmount = settings.balanceThreshold
        ? Math.round((balance - settings.balanceThreshold) * 100) / 100
        : !settings.allowsOverdraft
          ? balance
          : null;

      //calculate availableAmount based on the expenses sum and expensesThreshold
      let availableExpenses = settings.expensesThreshold
        ? Math.round((settings.expensesThreshold - expensesSum) * 100) / 100
        : null;

      //calculate availableAmount based on category data
      let availableCategoryAmount = transactionCategory.blockedBudget
        ? Math.round(transactionCategory.balance - transactionCategory.blockedBudget * 100) / 100
        : !settings.allowsOverdraft
          ? transactionCategory.balance
          : null

      //TODO - the worst ternary ever ...
      this.availableAmount = availableBalanceAmount === null
        ? availableExpenses === null
          ? availableCategoryAmount === null
              ? null
              : availableCategoryAmount
          : availableCategoryAmount === null
            ? availableExpenses
            : Math.min(availableExpenses, availableCategoryAmount)
        : availableExpenses === null
          ? availableCategoryAmount === null
              ? availableBalanceAmount
              : Math.min(availableBalanceAmount, availableCategoryAmount)
          : availableCategoryAmount === null
            ? Math.min(availableBalanceAmount, availableExpenses)
            : Math.min(availableBalanceAmount, availableExpenses, availableCategoryAmount);

      // this.availableAmountLimitType = availableAmount && availableExpenses
      //   ? availableAmount < availableExpenses
      //     ? 'Budget'
      //     : 'Ausgaben-Maximum'
      //   : availableAmount
      //     ? 'Budget'
      //     : availableExpenses
      //       ? 'Ausgaben-Maximum'
      //       : null;

      //return the lower of both      
      // return availableAmount && availableExpenses
      //   ? Math.min(availableAmount, availableExpenses)
      //   : availableAmount
      //     ? availableAmount
      //     : availableExpenses
      //       ? availableExpenses
      //       : null;
    },

    findAccount() {
      for (let i = 0; i < this.accountHolders.length; i++) {
        const bankAccounts = this.accountHolders[i].bankAccounts;

        for (let ii = 0; ii < bankAccounts.length; ii++) {
          if (bankAccounts[ii].accountNumber === this.selectedAccountNumber) {
            this.selectedAccount = bankAccounts[ii];
            break;
          }
        }
      }
    },

    async getAccountHolders() {
      const includeBankAccounts = true;
      const apiResponse = await AccountHolderService.getAll(includeBankAccounts);

      if (apiResponse.success && apiResponse.data) {
        this.accountHolders = apiResponse.data;
        this.bankAccountOptions = [];

        this.accountHolders.forEach((accountHolder) => {
          this.bankAccountOptions.push({
            value: accountHolder.name,
            disabled: true,
          });

          accountHolder.bankAccounts.forEach((bankAccount) => {
            
            if (bankAccount.accountSettings.receivesRevenues) {
              this.bankAccountOptions.push({
                value: bankAccount.accountNumber,
                disabled: false,
              });
            }

            //TODO - this doesnt belong into this function, it should live in its own
            //select the account which matches the id in the url
            if (bankAccount.id == this.$route.params.id) {
              this.selectedAccountNumber = bankAccount.accountNumber;
              this.selectedAccount = bankAccount;
            }
          });
        });
      }
      else if (apiResponse.success && !apiResponse.data) {
        this.accountHolders = [];
      }

      return apiResponse;
    },

    async getExternalParties() {
      const apiResponse = await ExternalPartyService.getAll();

      if (apiResponse.success && apiResponse.data) {
        this.counterParts = apiResponse.data;

        this.counterParts.forEach((counterPart) => {
          this.counterPartNames.push(counterPart.name);
        });
      } else if (apiResponse.success && !apiResponse.data) {
        this.counterParts = [];
      }

      return apiResponse;
    },

    async getTransactionCategories() {
      const apiResponse = await CostCenterService.getAllByAccount(this.selectedAccount.id, new Date().getFullYear(), new Date().getMonth());

      if (apiResponse.success && apiResponse.data) {
        this.categories = this.transactionType === 'revenue'
            ? apiResponse.data
            : apiResponse.data.filter(c => c.name !== 'Nicht zugewiesen');

        this.categoryOptions = [];

        this.categories.forEach((category) => {
          this.categoryOptions.push({
            value: category.name,
            disabled: false,
          });
        });

        this.selectedCategoryName = this.categories[0].name;
        this.selectedCategory = this.categories[0];

        this.availableAmount = this.transactionType !== 'revenue'
          ? this.calculateAvailableAmount(this.selectedAccount, this.selectedCategory)
          : null;

      } else if (apiResponse.success && !apiResponse.data) {
        this.categories = [];
      }

      return apiResponse;
    },

    pickItem(event) {
      // highlighting the match is realized by wrapping it in a <strong>-element
      // if the user clicks that part, we get the complete string from parentNode
      const clickedItem =
        event.target.tagName.toLowerCase() === "strong"
          ? event.target.parentNode.innerText
          : event.target.textContent;

      if (clickedItem.includes("Neu hinzufügen")) {
        this.selectedCounterPart = { name: this.counterPart.trim() };
      } else {
        this.includeCounterPartAccount = false;
        this.selectedCounterPart = this.counterParts.find(
          (c) => c.name === clickedItem
        );
        this.counterPart = this.selectedCounterPart.name;
      }
    },

    //TODO - refactor this method, split it up into multiple async functions?
    async save() {
      let externalBankAccountId = null;

      //TODO - if creation of new externalPary fails, it still tries to create an externalTransaction - I need to update the error handling here
      //if !this.selectedCounterPart.id -> it's a new counterPart, create a new one
      if (!this.selectedCounterPart.id) {
        const externalParty = {
          name: this.counterPart,
        };

        const createdExternalParty = await ExternalPartyService.createExternalParty(externalParty);

        if (createdExternalParty) {
          const externalBankAccount = {
            externalPartyId: createdExternalParty.id,
            iban: this.counterPartIban?.toUpperCase(),
            bic: this.counterPartBic?.toUpperCase(),
          };

          const createdExternalBankAccount =
            await ExternalBankAccountService.createExternalBankAccount(
              externalBankAccount
            );

          if (createdExternalBankAccount) {
            externalBankAccountId = createdExternalBankAccount.id;
          } else {
            //TODO - error handling?
          }
        } else {
          //TODO - error handling?
        }
      } else {
        externalBankAccountId = this.selectedCounterPart.externalBankAccount.id;
      }

      const currentDate = new Date().toISOString();
      const amount = NumberService.parseFloat(this.amount);

      const externalTransaction = {
        externalBankAccountId: externalBankAccountId,
        dateString: currentDate,
        amount: this.transactionType === 'revenue'
          ? amount * -1
          : amount,
        reference: this.reference,
      };
      const createdExternalTransaction =
        await ExternalTransactionService.createExternalTransaction(
          externalTransaction
        );

      if (!createdExternalTransaction) {
        //TODO - something went wrong - throw an error?
      } else {
        const internalTransaction = {
          internalBankAccountId: this.selectedAccount.id,
          transactionCategoryId: this.selectedCategory.id,
          dateString: currentDate,
          amount: this.transactionType === 'revenue'
            ? amount
            : amount * -1,
          reference: this.reference,
          counterPartTransactionToken:
            createdExternalTransaction.transactionToken,
          transactionToken:
            createdExternalTransaction.counterPartTransactionToken,
        };
        await InternalTransactionService.create(internalTransaction);

        if (!internalTransaction) {
          //TODO - something went wrong - throw an error?
        }
        else {
          this.$router.push('/');
        }
      }
    },

    updateCounterPartAccountData(event) {
      this.counterPartIban = event.iban;
      this.counterPartBic = event.bic;
    },
  },

  setup() {
    return {
      v$: useVuelidate(),
    };
  },

  validations() {
    let validation = {
      amount: { amountValidator },
      counterPartBic: { bicValidator },
      counterPartIban: { ibanValidator },
      counterPart: { required: counterPartValidator },
    };

    //i need different keys to show the appropriate error message
    if (this.transactionType === 'expense') {
      if (this.availableAmount !== null) {
        validation.amount.availableAmount = amountAvailableValidator(this.availableAmount);
      }
    }

    if (this.includeCounterPartAccount) {
      validation.counterPartIban.ibanDuplicate = ibanDuplicateValidator(this.ibans);

      return validation;
      // return {
      //   amount: { required, amountValidator },
      //   counterPart: { required },
      //   counterPartBic: { bicValidator },
      //   counterPartIban: {
      //     ibanValidator,
      //     ibanDuplicate: ibanDuplicateValidator(this.ibans),
      //   },
      // };
    } else {
      return validation;
      // return {
      //   amount: { required, amountValidator },
      //   counterPart: { required },
      //   counterPartBic: { bicValidator },
      //   counterPartIban: { ibanValidator },
      // };
    }
  },
};
</script>