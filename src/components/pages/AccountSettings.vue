<template>
  <!-- TODO - reduce letter-spacing on components h1s -->
  <div class="account-settings" v-if="dataLoaded">
    <AtomHeadline v-if="!showForm" tag="h1" :text="`Kontoeinstellungen (${account.accountNumber})`" />
    <div class="account-settings__main" v-if="!showForm">
      <AtomParagraph class="account-settings__edit-account-data pb-5" text="Kontodaten bearbeiten" @click="showForm = true" />
      <MoleculeInputCheckbox classList="pb-3" v-model="accountSettings.effectsExpenses" label="Ausgaben erlauben" :_switch="true"/>
      <MoleculeInputCheckbox classList="pb-3" v-model="accountSettings.receivesRevenues" label="Einnahmen erlauben" :_switch="true"/>
      <MoleculeInputCheckbox classList="pb-3" v-model="accountSettings.allowsOverdraft" label="Kontoüberziehung erlauben" :_switch="true"/>
      <!-- TODO - implement a little 'help'-icon for input fields, which provides info about the field when hovering it (question mark) -->
      <MoleculeInputText  classList="pb-3" field="balance-threshold" :hasErrors="balanceThresholdErrors" v-model="balanceThreshold"
                          :validation="v$.balanceThreshold" label="Mindestbetrag" :optional="true" @blur="v$.balanceThreshold.$touch()" />
      <MoleculeInputText classList="pb-3" field="expenses-threshold" :hasErrors="expensesThresholdErrors" v-model="expensesThreshold" :validation="v$.expensesThreshold"
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

import { InternalBankAccountService }   from '@/services/internal-bank-account-service.js';
import { AccountSettingsService }       from '@/services/account-settings-service.js';

import { accountSettingsValidation }    from '@/validation/validations';

export default {
  async created() {
    let result = null;

    result = await this.getAccount();

    if (result.success) {
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

  data() {
    return {
      dataLoaded: false,

      account: null,
      accountSettings: null,
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
      alert(accountId);
      this.accountSettings = await AccountSettingsService.get(accountId);

      if (this.accountSettings) {
        console.log('JO MAN');

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
    }
  },

  setup() {
    return {
      v$: useVuelidate(),
    };
  },

  validations() { return accountSettingsValidation; }
}
</script>