<template>
  <!-- TODO - reduce letter-spacing on components h1s -->
  <div class="account-settings" v-if="dataLoaded">
    <AtomHeadline v-if="!showForm" tag="h1" :text="`Kontoeinstellungen (${account.accountNumber})`" />
    <div class="account-settings__main" v-if="!showForm">
      <AtomParagraph class="account-settings__edit-account-data pb-5" text="Kontodaten bearbeiten" @click="showForm = true" />
      <MoleculeInputCheckbox classList="pb-3" v-model="effectsExpenses" label="Ausgaben erlauben" :_switch="true"/>
      <MoleculeInputCheckbox classList="pb-3" v-model="receivesRevenues" label="Einnahmen erlauben" :_switch="true"/>
      <MoleculeInputCheckbox classList="pb-3" v-model="allowsOverdraft" label="Kontoüberziehung erlauben" :_switch="true"/>
      <!-- TODO - implement a little 'help'-icon for input fields, which provides info about the field when hovering it (question mark) -->
      <!-- TODO color red when input is negative -->
      <MoleculeInputText  classList="pb-5" field="balance-threshold" :hasErrors="balanceThresholdErrors" v-model="balanceThreshold"
                          :validation="v$.balanceThreshold" label="Mindestbetrag" :optional="true" @blur="v$.balanceThreshold.$touch()" />
      <MoleculeInputText classList="pb-5" field="expenses-threshold" :hasErrors="expensesThresholdErrors" v-model="expensesThreshold" :validation="v$.expensesThreshold"
                         label="Obergrenze für Ausgaben (pro Monat)" :optional="true" @blur="v$.expensesThreshold.$touch()" />
    </div>
    <div class="account-settings__form" v-else>
      <OrganismAccountForm @cancel="showForm = false" @save="saveAccountData" :formData="formData" :newAccount="false" :headline="formHeadline" />
    </div>
  </div>
</template>

<script>
import { useVuelidate }                 from '@vuelidate/core';

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
    let result = null;

    result = await this.getAccount();

    if (result.success) {console.log(this.account);
      result = await this.getAccountSettings(this.account.id);

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
          : NumberService.amountToString(this.balanceThreshold);

      if (value === null || value < 0) {
        this.allowsOverdraft = true;
      }
      else if (value >= 0) {
        this.allowsOverdraft = false;
      }
    },

    expensesThreshold() {
      this.v$.expensesThreshold.$touch();
    }
  },

  data() {
    return {
      dataLoaded: false,

      account: null,

      effectsExpenses: true,
      receivesRevenues: true,
      allowsOverdraft: true,
      balanceThreshold: null,
      expensesThreshold: null,

      formData: null,
      formHeadline: 'Kontodaten bearbeiten',
      showForm: false,

      threshold: null,
    };
  },

  methods: {
    async getAccount() {
      const simpleBankAccount = true;
      this.account = await InternalBankAccountService.getById(this.$route.params.id, simpleBankAccount);

      if (this.account) {
        this.formData = {
          account: this.account,
          ibans: [ this.account.iban ],
        };

        this.dataLoaded = true;

        return {
          success: true,
          error: null,
        };
      }
      else {
        return {
          success: false,
          error: 'Error fetching account',
        };
      }
    },

    async getAccountSettings(accountId) {
      const accountSettings = await AccountSettingsService.get(accountId);

      if (accountSettings) {
        this.effectsExpenses = accountSettings.effectsExpenses;
        this.receivesExpenses = accountSettings.receivesExpenses;
        this.allowsOverdraft = accountSettings.allowsOverdraft;
        this.balanceThreshold = NumberService.amountToString(accountSettings.balanceThreshold);
        this.expensesThreshold = NumberService.amountToString(accountSettings.expensesThreshold);

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
    }
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