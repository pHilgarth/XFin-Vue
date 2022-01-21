<template>
  <!-- TODO - reduce letter-spacing on components h1s -->
  <div class="account-settings" v-if="dataLoaded">
    <AtomHeadline v-if="!showForm" tag="h1" :text="`Kontoeinstellungen (${account.accountNumber})`" />
    <div class="account-settings__main" v-if="!showForm">
      <div class="account-settings__edit-account-data pb-2">
        <AtomParagraph class="xfin-button--light" text="Kontodaten bearbeiten" @click="showForm = true" />
      </div>
      <MoleculeInputCheckbox classList="pb-3" v-model="effectsExpenses" label="Ausgaben erlauben"
                             :disabled="expensesThresholdDisabled" :_switch="true"/>
      <MoleculeInputCheckbox classList="pb-3" v-model="receivesRevenues" label="Einnahmen erlauben" :_switch="true"/>
      <MoleculeInputCheckbox classList="pb-4" v-model="allowsOverdraft" label="Kontoüberziehung erlauben"
                             :disabled="overdraftDisabled" :_switch="true"/>
      <!-- TODO - implement a little 'help'-icon for input fields, which provides info about the field when hovering it (question mark) -->
      <!-- TODO color red when input is negative -->
      <MoleculeInputText  classList="pb-5" field="balance-threshold" :hasErrors="balanceThresholdErrors" v-model="balanceThreshold"
                          :validation="v$.balanceThreshold" label="Mindestbetrag" :optional="true" @blur="v$.balanceThreshold.$touch()" />
      <MoleculeInputText classList="pb-5" field="expenses-threshold" :hasErrors="expensesThresholdErrors" v-model="expensesThreshold" :validation="v$.expensesThreshold"
                         label="Obergrenze für Ausgaben (pro Monat)" :optional="true" @blur="v$.expensesThreshold.$touch()" />
      <AtomButton class="xfin-button" text="Speichern" @click="saveAccountSettings"/>
    </div>
    <div class="account-settings__form" v-else>
      <OrganismAccountForm @cancel="showForm = false" @save="saveAccountData" :formData="formData" :newAccount="false" :headline="formHeadline" />
    </div>
  </div>
</template>

<script>
import { useVuelidate }                 from '@vuelidate/core';

import AtomButton                       from '@/components/atoms/AtomButton';
import AtomHeadline                     from '@/components/atoms/AtomHeadline';
import AtomParagraph                    from '@/components/atoms/AtomParagraph';
import MoleculeInputCheckbox            from '@/components/molecules/MoleculeInputCheckbox';
import MoleculeInputText                from '@/components/molecules/MoleculeInputText';
import OrganismAccountForm              from '@/components/organisms/OrganismAccountForm';

import { AccountSettingsService }       from '@/services/account-settings-service';
import { InternalBankAccountService }   from '@/services/internal-bank-account-service';
import { NumberService }                from '@/services/number-service';

//import { accountSettingsValidation }    from '@/validation/validations';
import {
  balanceThresholdValidator,
  balanceThresholdMaxValidator,
  expensesThresholdValidator }          from '@/validation/custom-validators';

export default {
  async created() {
    let apiResponse = await this.getAccount();

    if (apiResponse.success) {
      apiResponse = await this.getAccountSettings(this.account.id);

      if (apiResponse.success) {
        this.dataLoaded = true;
      } else {
        console.error(apiResponse.error);
      }
    } else {
      console.error(apiResponse.error);
    }
  },

  components: {
    AtomButton,
    AtomHeadline,
    AtomParagraph,
    MoleculeInputCheckbox,
    MoleculeInputText,
    OrganismAccountForm,
  },

  computed: {
    balanceThresholdErrors() { return this.v$.balanceThreshold.$error; },
    expensesThresholdErrors() { return this.v$.expensesThreshold.$error; },
  },

  watch: {
    balanceThreshold() {
      this.v$.balanceThreshold.$touch();

      const value = this.balanceThreshold === ''
          ? null
          //TODO - why amountToString? Delete, if wrong
          //: NumberService.amountToString(this.balanceThreshold);
          : NumberService.parseFloat(this.balanceThreshold);

      if (value === null) {
        this.allowsOverdraft = true;
        this.overdraftDisabled = false;
      }
      else {
        this.allowsOverdraft = value < 0;
        this.overdraftDisabled = true;
      }
    },

    expensesThreshold() {
      this.v$.expensesThreshold.$touch();

      const value = this.expensesThreshold === ''
        ? null
        : NumberService.parseFloat(this.expensesThreshold);

      this.effectsExpenses = value !== 0;
      this.expensesThresholdDisabled = value === 0;

    }
  },

  data() {
    return {
      dataLoaded: false,

      account: null,
      originalAccountSettings: null,

      effectsExpenses: true,
      receivesRevenues: true,
      allowsOverdraft: true,
      overdraftDisabled: false,
      balanceThreshold: null,
      expensesThreshold: null,
      expensesThresholdDisabled: false,

      formData: null,
      formHeadline: 'Kontodaten bearbeiten',
      showForm: false,

      threshold: null,
    };
  },

  methods: {
    //TODO - can I move this function into a service? It's duplicated in OrganismAccountHolder.vue
    checkForChanges(sourceObject, targetObject, subset) {
      const sourceSubset = subset(sourceObject);
      const updateSubset = subset(targetObject);
      const changed = [];

      for (const prop in sourceSubset) {
        if (sourceSubset[prop] !== updateSubset[prop]) {
          changed.push(prop);
        }
      }

      return changed;
    },

    async getAccount() {
      const simpleBankAccount = true;
      const apiResponse = await InternalBankAccountService.getById(this.$route.params.id, simpleBankAccount);

      if (apiResponse.success && apiResponse.data) {
        this.account = apiResponse.data;

        this.formData = {
          account: this.account,
          ibans: [ this.account.iban ],
        };

        this.dataLoaded = true;

        return apiResponse;
      }
    },

    //TODO - API Call optimieren, so wie überall
    async getAccountSettings(accountId) {
      const accountSettings = await AccountSettingsService.getByAccount(accountId);
      if (accountSettings.data) {
        console.log(`balanceThreshold: ${accountSettings.data.balanceThreshold} (${typeof accountSettings.data.balanceThreshold})`);
        console.log(`expensesThreshold: ${accountSettings.data.expensesThreshold} (${typeof accountSettings.data.expensesThreshold})`);
        this.originalAccountSettings =  accountSettings.data;
        this.effectsExpenses =          accountSettings.data.effectsExpenses;
        this.receivesRevenues =         accountSettings.data.receivesRevenues;
        this.allowsOverdraft =          accountSettings.data.allowsOverdraft;
        this.balanceThreshold =         NumberService.amountToString(accountSettings.data.balanceThreshold);
        this.expensesThreshold =        NumberService.amountToString(accountSettings.data.expensesThreshold);

        return {
          success: true,
          error: null,
        };
      }
      else {
        return {
          success: false,
          error: 'Error fetching accountSettings!',
        };
      }
    },

    async saveAccountSettings() {
      const updatedSettings = {
        effectsExpenses: this.effectsExpenses,
        receivesRevenues: this.receivesRevenues,
        allowsOverdraft: this.allowsOverdraft,
        balanceThreshold: NumberService.parseFloat(this.balanceThreshold),
        expensesThreshold: NumberService.parseFloat(this.expensesThreshold),
      };

      const jsonPatch = [];

      const subset =
          ({ effectsExpenses, receivesRevenues, allowsOverdraft, balanceThreshold, expensesThreshold }) =>
              ({ effectsExpenses, receivesRevenues, allowsOverdraft, balanceThreshold, expensesThreshold });

      for (const prop of this.checkForChanges(this.originalAccountSettings, updatedSettings, subset)) {
        jsonPatch.push({
          op: "replace",
          path: `/${prop}`,
          value: updatedSettings[prop],
        });
      }

      console.log(this.originalAccountSettings.id);

      const updateResponse = await AccountSettingsService.update(this.originalAccountSettings.id, jsonPatch);

      if (!updateResponse.success) {
        alert(updateResponse.error);
      }
      else {
        this.$router.push('/');
      }

    },

    async saveAccountData(updatedAccount) {
      const jsonPatch = [];
      const subset = ({ iban, bic, bank, description }) => ({ iban, bic, bank, description });

      for (const prop of this.checkForChanges(this.account, updatedAccount, subset)) {
        jsonPatch.push({
          op: "replace",
          path: `/${prop}`,
          value: updatedAccount[prop],
        });
      }

      const updateResponse = await InternalBankAccountService.update(updatedAccount.id, jsonPatch);

      if (!updateResponse.success) {
        alert(updateResponse.error);
      }
      else {
        this.account = updatedAccount;
        this.formData.account = updatedAccount;
        this.showForm = false;
      }
    },
  },

  setup() {
    return {
      v$: useVuelidate(),
    };
  },

  validations() {
    let validation = { expensesThreshold: { expensesThresholdValidator } };

    if (this.account) {
      validation.balanceThreshold = {
        amount: balanceThresholdValidator,
        maxAmount: balanceThresholdMaxValidator(this.account.balance) };
    }

    return validation;
  }
}
</script>