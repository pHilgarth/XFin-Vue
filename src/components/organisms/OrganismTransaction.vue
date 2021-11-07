<!-- TODO on new expense: check the available amount on the selected account and category -->
<!-- TODO the available amount is infinite, if the user didnt set any settings -->
<!-- TODO the user can configure the accounts so its not possible to spend more money than to an certain balance (gesperrtes Budget und so, nicht ins minus)-->
<template>
  <div class="transaction">
    <section class="transaction-body">
      <h1>{{ transactionType === 'revenue' ? 'Einnahme' : 'Ausgabe' }} eintragen</h1>
      <form class="xfin-account-form" v-if="dataLoaded">
        <MoleculeInputSelect  classList="transaction__account" :options="bankAccountOptions" field="account" v-model="selectedAccountNumber" label="Konto" />
        <MoleculeInputSelect  classList="transaction__category" :options="categoryOptions" field="category" v-model="selectedCategoryName" label="Kostenstelle"
                              @update:modelValue="selectedCategory = categories.find(c => c.name === $event)" />

        <div class="transaction__counter-part">
          <MoleculeInputAutoSuggest :classList="paddingAutoSuggest" field="counter-part" :hasErrors="counterPartErrors" v-model="counterPart"
                                    :validation="v$.counterPart" :label="`${transactionType === 'revenue' ? 'Zahlungspflichtiger' : 'Zahlungsempfänger'}`"
                                    :items="counterPartNames" noItemsFallback="&plus; Neu hinzufügen"
                                    :alwaysShowFallback="true" @blur="blurAutoSuggest" @itemPicked="pickItem" />

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
        <!-- TODO - adjust validation regex! users are forced to type in a 100% valid amount. Just "10" is not possible, but thats bad UX -->
        <MoleculeInputText  classList="pb-5" field="amount" :hasErrors="amountErrors" v-model="amount" :validation="v$.amount" label="Betrag"
                            @blur="v$.amount.$touch()" />

       <AtomButton classList="xfin-form__button" text="Speichern" :disabled="saveDisabled" @click.prevent="save" />
      </form>
    </section>
  </div>
</template>

<script>
//TODO - i need to refactor this component, its crap. I had to place counterPartAccountData into its own child component for the client side iban duplicate check
//TODO - because of async created() i dont knwow how to add the ibanDuplicateValidator or pass the ibans to it - the current way of doing this is ugly as fuck
//TODO - watch the course on async programming on pluralsight!! There must be a way to realize this

//TODO - refactor every component to use the same import structure: 1. third-party-libs 2. my components 3. my services
import { useVuelidate }                 from '@vuelidate/core';
import { required }                     from "@vuelidate/validators";


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

import {
  amountValidator,
  bicValidator,
  ibanDuplicateValidator,
  ibanValidator, }                      from "@/validation/custom-validators";

export default {
  //TODO - maybe tweak this error handling?
  async created()                       {
                                          let result = null;
                                          result = await this.getAccountHolders();

                                          if (result.success) {
                                            result = await this.getExternalParties();
                                          } else {
                                            console.error(result.error);
                                          }

                                          if (result.success) {
                                            result = await this.getTransactionCategories();
                                          } else {
                                            console.error(result.error);
                                          }

                                          if (result.success) {
                                            this.dataLoaded = true;
                                          } else {
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

  props: {
    transactionType:                    { type: String, required: true },
  },

  computed: {
    amountErrors()                      { return this.v$.amount.$error; },
    counterPartErrors()                 { return this.v$.counterPart.$error; },
    counterPartIbanErrors()             { return this.v$.counterPartIban.$error; },
    counterPartBicErrors()              { return this.v$.counterPartBic.$error; },
    paddingAutoSuggest()                { return this.selectedCounterPart && !this.selectedCounterPart.id ? 'pb-1' : 'pb-5'; },

    saveDisabled()                      {
                                        return !this.includeCounterPartAccount
                                            ? this.v$.amount.$silentErrors.length > 0 || !this.selectedCounterPart
                                            : this.v$.$silentErrors.length > 0 || !this.selectedCounterPart;
                                        },
    showCheckbox()                      {
                                          return this.selectedCounterPart && !this.selectedCounterPart.id;
                                        },
  },

  watch: {
    amount()                            { this.v$.amount.$touch(); },

    counterPart()                       {
                                          if (!this.counterParts.find(c => c.name === this.counterPart)) {
                                            this.selectedCounterPart = null;
                                          }
                                        },

    includeCounterPartAccount()         {
                                          this.ibans !== null
                                            ? Array.from([
                                              this.accountHolders.map(a => a.bankAccounts.map(b => b.iban)).flat(),
                                              ...this.counterParts.map(c => c.externalBankAccount.iban )
                                              ]).flat().filter(i => i !== null)
                                            : this.ibans;

                                          console.log(this.ibans);
                                        },

    selectedAccountNumber()             {
                                          this.findAccount();
                                          this.$router.push(`/new-${this.transactionType}/${this.selectedAccount.id}`);
                                        }
  },

  data() {
    return {
      dataLoaded:                       false,
      ibans:                            null,

      accountHolders:                   [],
      bankAccountOptions:               null,
      categories:                       null,
      categoryOptions:                  null,
      counterParts:                     null,
      counterPartNames:                 [],

      selectedAccountNumber:            null,
      selectedAccount:                  null,
      selectedCategoryName:             null,
      selectedCategory:                 null,

      //counterPart is the v-model property for the input field - it refers to a counterParts name and is of type string
      counterPart:                      null,
      //selectedCounterPart is the actual counterPartObject which contains the id and the externalBankAccountId if it's a persisted counterPart
      selectedCounterPart:              null,
      reference:                        '',
      amount:                           '',

      includeCounterPartAccount:        false,
      counterPartIban:                  null,
      counterPartBic:                   null,
    };
  },

  methods: {
    blurAutoSuggest()                   {
                                          if (!this.selectedCounterPart) {
                                            this.counterPart = '';
                                          }

                                          this.v$.counterPart.$touch();
                                        },

    findAccount()                       {
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

    async getAccountHolders()           {
                                          const includeBankAccounts = true;
                                          this.accountHolders = await AccountHolderService.getAll(
                                            includeBankAccounts
                                          );

                                          if (this.accountHolders) {
                                            this.bankAccountOptions = [];

                                            this.accountHolders.forEach((accountHolder) => {
                                              this.bankAccountOptions.push({
                                                value: accountHolder.name,
                                                disabled: true,
                                              });

                                              accountHolder.bankAccounts.forEach((bankAccount) => {
                                                this.bankAccountOptions.push({
                                                  value: bankAccount.accountNumber,
                                                  disabled: false,
                                                });

                                                //TODO - this doesnt belong into this function, it should live in its own
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
                                          } else {
                                            return {
                                              success: false,
                                              error: 'Error fetching accountHolders',
                                            };
                                          }
                                        },

    async getExternalParties()          {
                                          this.counterParts = await ExternalPartyService.getExternalParties();
                                          if (this.counterParts) {
                                            this.counterParts.forEach((counterPart) => {
                                              this.counterPartNames.push(counterPart.name);
                                            });

                                            return {
                                              success: true,
                                              error: null,
                                            };
                                          } else {
                                            return {
                                              success: false,
                                              error: 'Error fetching externalParties',
                                            };
                                          }
                                        },

    async getTransactionCategories()    {
                                          this.categories =
                                            await TransactionCategoryService.getTransactionCategories();

                                          if (this.categories) {
                                            this.categoryOptions = [];

                                            this.categories.forEach((category) => {
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
                                          } else {
                                            return {
                                              success: false,
                                              error: 'Error fetching transactionCategories',
                                            };
                                          }
                                        },

    pickItem(event)                     {
                                          // highlighting the match is realized by wrapping it in a <strong>-element
                                          // if the user clicks that part, we get the complete string from parentNode
                                          const clickedItem =
                                            event.target.tagName.toLowerCase() === 'strong'
                                              ? event.target.parentNode.innerText
                                              : event.target.textContent;

                                          if (clickedItem.includes('Neu hinzufügen')) {
                                            this.selectedCounterPart = { name: this.counterPart.trim() };
                                          } else {
                                            this.includeCounterPartAccount = false;
                                            this.selectedCounterPart = this.counterParts.find(c => c.name === clickedItem);
                                            this.counterPart = this.selectedCounterPart.name;
                                          }
                                        },

    //TODO - refactor this method, split it up into multiple async functions?
    async save()                        {
                                          let externalBankAccountId = null;

                                          if (!this.selectedCounterPart.id) {
                                            const externalParty = {
                                              name: this.counterPart,
                                            };

                                            const createdExternalParty =
                                              await ExternalPartyService.createExternalParty(externalParty);

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
                                            amount: amount * -1,
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
                                              amount: amount,
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
                                          }
                                        },

    updateCounterPartAccountData(event) {
                                          this.counterPartIban = event.iban;
                                          this.counterPartBic = event.bic;
                                        },
  },

  setup()                               {
                                          return {
                                            v$: useVuelidate(),
                                          };
                                        },

  validations()                         { 
                                          if (this.includeCounterPartAccount) {
                                            return {
                                              amount:                 { required, amountValidator },
                                              counterPart:            { required },
                                              counterPartBic:         { bicValidator },
                                              counterPartIban:        { ibanValidator, ibanDuplicate: ibanDuplicateValidator(this.ibans), }
                                            }
                                          }
                                          else {
                                            return {
                                              amount:                 { required, amountValidator },
                                              counterPart:            { required },
                                              counterPartBic:         { bicValidator },
                                              counterPartIban:        { ibanValidator }
                                            }
                                          }
                                        },
};
</script>