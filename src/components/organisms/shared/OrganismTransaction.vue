<template>
  <div class="organism-transaction">
    <h1>{{ transactionType === 'revenue' ? 'Einnahme' : 'Ausgabe' }} eintragen</h1>
    <MoleculeLoading v-if="!dataLoaded" :loadingError="loadingError" errorMessage="Fehler beim Laden der Daten!"/>

    <form v-else>
      <MoleculeInputSelect class="organism-transaction__account" :options="bankAccountOptions" field="account" v-model="selectedAccountId" label="Konto"/>

      <MoleculeInputSelect  class="organism-transaction__cost-center mb-5 pb-5" :options="costCenterOptions" field="costCenter" v-model="costCenter" label="Kostenstelle"
                            :validation="v$.costCenter" :hasErrors="v$.costCenter.$error" @blur="v$.costCenter.$touch()"/>

      <div class="organism-transaction__counter-part pb-5">
        <MoleculeInputAutoSuggest field="counter-part" :hasErrors="v$.counterPart?.$error"
                                  v-model="counterPart"
                                  :validation="v$.counterPart"
                                  :label="`${transactionType === 'revenue' ? 'Zahlungspflichtiger' : 'Zahlungsempfänger'}`"
                                  :items="counterPartNames" noItemsFallback="&plus; Neu hinzufügen"
                                  :alwaysShowFallback="true"
                                  :errorMessageParams="{ counterPartType: transactionType === 'revenue' ? 'Zahlungspflichtigen' : 'Zahlungsempfänger' }"
                                  @blur="counterPart = !selectedCounterPart ? '' : counterPart" @itemPicked="pickItem"/>

        <MoleculeInputCheckbox v-if="selectedCounterPart && !selectedCounterPart.id"
                               class="pt-3" field="include-counter-part-account"
                               v-model="includeCounterPartAccount" label="Bankdaten hinzufügen" :renderAsSwitch="true"/>

        <div v-if="includeCounterPartAccount" class="organism-transaction__counter-part-account pt-3">
          <MoleculeInputText class="organism-transaction__counter-part-account-data" field="counter-part-iban"
                             :hasErrors="v$.counterPartIban.$error" v-model="counterPartIban"
                             :validation="v$.counterPartIban" label="IBAN"
                             @blur="v$.counterPartIban.$touch()"/>

          <MoleculeInputText class="organism-transaction__counter-part-account-data" field="counter-part-bic"
                             :hasErrors="v$.counterPartBic.$error"
                             v-model="counterPartBic" :validation="v$.counterPartBic" label="BIC"
                             @blur="v$.counterPartBic.$touch()"/>
        </div>
      </div>

      <MoleculeInputText class="pb-5" field="reference" :hasErrors="v$.reference.$error" v-model="reference"
                         :validation="v$.reference" label="Verwendungszweck"
                         @blur="v$.reference.$touch()"/>
      <!-- TODO - den verfügbaren Betrag immer anzeigen lassen! (heute verfügbar, wie im OnlineBanking) -->
      <MoleculeInputText class="pb-5" field="amount" :hasErrors="v$.amount.$error" v-model="amount"
                         :validation="v$.amount" label="Betrag"
                         @blur="v$.amount.$touch()"/>

      <MoleculeInputSelect class="pb-5" :options="transactionRoles" field="transactionRole" v-model="transactionRole" label="Typ"
                           :validation="v$.transactionRole" :hasErrors="v$.transactionRole.$error" @blur="v$.transactionRole.$touch()"/>

      <AtomButton type="primary" text="Speichern" :disabled="v$.$silentErrors.length > 0" @click.prevent="save"/>
    </form>
  </div>
</template>

<script>
//TODO - i need to refactor this component, its crap. I had to place counterPartAccountData into its own child component for the client side iban duplicate check
//TODO - because of async created() i dont knwow how to add the ibanDuplicateValidator or pass the ibans to it - the current way of doing this is ugly as fuck
//TODO - watch the course on async programming on pluralsight!! There must be a way to realize this

//TODO - when no reference is provided, it should be NULL in db not ''

//TODO - refactor every component to use the same import structure: 1. third-party-libs 2. my components 3. my services
import {useVuelidate} from "@vuelidate/core";

import AtomButton from "@/components/atoms/shared/AtomButton";
import MoleculeInputAutoSuggest from "@/components/molecules/MoleculeInputAutoSuggest";
import MoleculeInputCheckbox from "@/components/molecules/shared/MoleculeInputCheckbox";
import MoleculeInputSelect from "@/components/molecules/shared/MoleculeInputSelect";
import MoleculeInputText from "@/components/molecules/shared/MoleculeInputText";
import MoleculeLoading from '@/components/molecules/shared/MoleculeLoading';

import {CopyService} from '@/services/copy-service';
import {numberService} from "@/services/number-service";
import {AccountHolderService} from "@/services/account-holder-service";
import {ExternalBankAccountService} from "@/services/external-bank-account-service";
import {ExternalPartyService} from "@/services/external-party-service";
import {InternalTransactionService} from "@/services/internal-transaction-service";
import {ExternalTransactionService} from "@/services/external-transaction-service";
import {CostCenterService} from "@/services/cost-center-service";
import {transactionRoles} from '@/services/transaction-role-service';
import {transactionValidation} from '@/validation/validations';
import {
  bicValidator,
  costCenterValidator,
  ibanDuplicateValidator,
  ibanValidator,
  transactionRoleValidator,
} from "@/validation/custom-validators";


export default {
  //TODO - tweak this error handling -  it is so ugly
  async created() {
    let apiResponse = await this.getAccountHolders();

    if (apiResponse.success) {
      apiResponse = await this.getExternalParties();

      if (apiResponse.success) {
        apiResponse = await this.getCostCenters();

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

    if (this.transactionType === 'expense') {
      delete this.transactionRoles.savingRate;
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
    transactionType: {type: String, required: true},
  },

  watch: {
    amount() {
      this.v$.amount.$touch();
    },

    costCenter() {
      this.v$.costCenter.$touch();
    },

    counterPart() {
      this.v$.counterPart.$touch();

      if (!this.counterPart) {
        this.includeCounterPartAccount = false;
      }

      if (!this.counterParts.find((c) => c.name === this.counterPart)) {
        this.selectedCounterPart = null;
      }
    },

    counterPartBic() {
      if (this.counterPartBic) {
        this.counterPartBic = this.counterPartBic.toUpperCase();
        this.v$.counterPartBic.$touch();
      }
    },

    counterPartIban() {
      if (this.counterPartIban) {
        this.counterPartIban = this.counterPartIban.toUpperCase();
        this.v$.counterPartIban.$touch();
      }
    },

    includeCounterPartAccount() {
      if (this.includeCounterPartAccount) {
        this.ibans = this.ibans === null
            ? Array.from([
              this.accountHolders.map((a) => a.bankAccounts.map((b) => b.iban)).flat(),
              ...this.counterParts.map((c) => c.externalBankAccount.iban),
            ]).flat().filter((i) => i !== null)
            : this.ibans;
      } else {
        this.ibans = null;
        this.counterPartIban = null;
        this.counterPartBic = null;
        this.v$.counterPartIban.$reset();
        this.v$.counterPartBic.$reset();
      }
    },

    reference() {
      this.v$.reference.$touch();
    },

    selectedAccountId() {
      this.$router.push(`/new-${this.transactionType}/${this.selectedAccountId}`);
    },

    transactionRole() {
      this.v$.transactionRole.$touch();
    }
  },

  data() {
    return {
      dataLoaded: false,
      loadingError: false,

      ibans: null,

      accountHolders: null,
      bankAccountOptions: null,
      costCenters: null,
      costCenter: null,
      costCenterOptions: [],
      counterParts: null,
      counterPartNames: [],
      transactionRoles: CopyService.copyObject(transactionRoles),

      selectedAccountId: this.$route.params.id,
      selectedAccount: null,
      //gonna need this when implementing transactionRoles
      transactionRole: transactionRoles['default'],

      //TODO - can I use IDs here too? As in selectedAccountId (-1 would be for new counterPart)
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
    //TODO - i should move these get....() methods into the service or update the services, so I can call them from the created method
    async getAccountHolders() {
      const includeBankAccounts = true;
      const apiResponse = await AccountHolderService.getAll(includeBankAccounts);

      if (apiResponse.success && apiResponse.data) {
        this.accountHolders = apiResponse.data;
        this.bankAccountOptions = [];

        this.accountHolders.forEach((accountHolder) => {
          this.bankAccountOptions.push({
            label: accountHolder.name,
            disabled: true,
          });

          accountHolder.bankAccounts.forEach((bankAccount) => {
            this.bankAccountOptions.push({
              value: bankAccount.id,
              label: bankAccount.accountNumber,
            });

            //TODO - this doesnt belong into this function, it should live in its own
            //select the account which matches the id in the url
            if (bankAccount.id == this.$route.params.id) {
              this.selectedAccount = bankAccount;
            }
          });
        });
      } else if (apiResponse.success && !apiResponse.data) {
        this.accountHolders = [];
      }

      return apiResponse;
    },

    //TODO - i should move these get....() methods into the service or update the services, so I can call them from the created method
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

    //TODO - i should move these get....() methods into the service or update the services, so I can call them from the created method
    async getCostCenters() {
      const apiResponse = await CostCenterService.getAllByAccount(this.selectedAccount.id, new Date().getFullYear(), new Date().getMonth());

      if (apiResponse.success && apiResponse.data) {
        //TODO - remove this hardcoded string "Nicht zugewiesen" and move it to some kind of service (and here just compare the value of a key that never changes
        this.costCenters = this.transactionType === 'revenue'
            ? apiResponse.data
            : apiResponse.data.filter(c => c.name !== 'Nicht zugewiesen');

        //this.costCenterOptions = ['- Kostenstelle wählen -'];
        this.costCenterOptions = [];

        this.costCenters.forEach((costCenter) => {
          this.costCenterOptions.push(costCenter.name);
        });

        this.costCenter = this.costCenterOptions[0];

      } else if (apiResponse.success && !apiResponse.data) {
        this.costCenters = [];
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
        this.selectedCounterPart = {name: this.counterPart.trim()};
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
      const amount = numberService.parseFloat(this.amount);

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
          costCenterId: this.selectedCostCenter.id,
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
        } else {
          this.$router.push('/');
        }
      }
    },
  },

  setup() {
    return {
      v$: useVuelidate(),
    };
  },

  validations() {
    //it does not work, if I simply assign transactionValidation to validation, it has to be a separate object
    let validation = CopyService.copyObject(transactionValidation);

    validation.costCenter = { costCenterValidator: costCenterValidator(this.transactionRole) };
    validation.transactionRole = { transactionRoleValidator: transactionRoleValidator(this.costCenter) };

    if (this.includeCounterPartAccount) {
      validation.counterPartBic = {bicValidator};
      validation.counterPartIban = {ibanValidator, ibanDuplicate: ibanDuplicateValidator(this.ibans)};
    }

    return validation;
  }
};
</script>