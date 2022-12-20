<template>
  <div class="new-loan">
    <AtomHeadline tag="h1" text="Darlehen anlegen" />

    <MoleculeLoading v-if="!dataLoaded" :loadingError="loadingError" errorMessage="Fehler beim Laden der Daten!"/>

    <form v-else>
      <div class="pb-5">
        <MoleculeInputAutoSuggest field="creditor-account" v-model="creditorAccount" label="Gläubiger" :required="true" :items="creditorAccounts"
                                  :validation="v$.creditorAccount" :hasErrors="v$.creditorAccount?.$error" @blur="onBlurCreditorAccount"
                                  @itemPicked="pickItem($event, 'creditorAccount')"/>
      </div>

      <div class="pb-5">
        <MoleculeInputAutoSuggest field="debitor-account" label="Schuldner" v-model="debitorAccount" :required="true" :items="debitorAccounts"
                                  :validation="v$.debitorAccount" :hasErrors="v$.debitorAccount?.$error" @blur="onBlurDebitorAccount"
                                  @itemPicked="pickItem($event, 'debitorAccount')"/>
      </div>

      <div class="pb-5">
        <MoleculeInputText field="reference" label="Verwendungszweck" v-model="reference" :required="true"
                           :validation="v$.reference" :hasErrors="v$.reference.$error" @blur="v$.reference.$touch" />
      </div>

      <div class="pb-5">
        <MoleculeInputText field="amount" label="Darlehensbetrag" v-model="amount" :required="true"
                           :validation="v$.amount" :hasErrors="v$.amount.$error" @blur="v$.amount.$touch()" />
      </div>

      <div class="pb-5">
        <MoleculeInputText field="life" label="Laufzeit in Monaten" v-model="life" :validation="v$.life"
                             :hasErrors="v$.life.$error" @blur="v$.life.$touch" />

      </div>

      <div class="pb-5">
        <MoleculeInputText field="rate-of-interest" label="Zinssatz in Prozent" v-model="rateOfInterest" :validation="v$.rateOfInterest"
                             :hasErrors="v$.rateOfInterest.$error" @blur="v$.rateOfInterest.$touch" />
      </div>

      <div class="pb-5">
        <MoleculeInputText field="monthly-installment" label="Monatliche Rate" v-model="monthlyInstallment" :validation="v$.monthlyInstallment"
                           :hasErrors="v$.monthlyInstallment.$error" @blur="v$.monthlyInstallment.$touch" />
      </div>

<!--      <Datepicker class="vuepic-datepicker pb-5" v-model="targetDate" placeholder="Zieldatum" locale="de" :minDate="new Date()" :enableTimePicker="false" autoApply />-->

      <AtomButton type="primary" text="Speichern" @click.prevent="saveLoan" :disabled="v$.$silentErrors.length"/>
      <AtomButton text="Abbrechen" type="cancel" @click.prevent="$router.push('/loans')" />
    </form>
  </div>
</template>

<script>

//import Datepicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css'

import { useVuelidate } from "@vuelidate/core";

import AtomButton from '@/components/atoms/AtomButton';
import AtomHeadline from '@/components/atoms/AtomHeadline';

import MoleculeInputAutoSuggest from '@/components/molecules/MoleculeInputAutoSuggest';
import MoleculeInputText from '@/components/molecules/MoleculeInputText';
import MoleculeLoading from '@/components/molecules/MoleculeLoading';

import { accountService } from '@/services/account-service';
import { copyService } from '@/services/copy-service';
//import { numberService } from '@/services/number-service';
import { loanService } from '@/services/loan-service';
import { loanValidation } from "@/validation/validations";

export default {
  components: {
    //Datepicker,
    AtomButton,
    AtomHeadline,
    MoleculeInputAutoSuggest,
    MoleculeInputText,
    MoleculeLoading,
  },

  async created() {
    try {
      await this.getData();

      this.dataLoaded = true;
    } catch (error) {
      this.loadingError = true;
    }
  },

  watch: {
    amount() {
      this.v$.amount.$touch();
    },

    creditorAccount() {
      this.updateAccounts('creditorAccount', 'debitorAccounts');
    },

    debitorAccount() {
      this.updateAccounts('debitorAccount', 'creditorAccounts');
    },

    life() {
      this.v$.life.$touch();
    },

    monthlyInstallment() {
      this.v$.monthlyInstallment.$touch();
    },

    rateOfInterest() {
      this.v$.rateOfInterest.$touch();
    },
  },

  data() {
    return {
      amount: null,
      accountHolders: null,
      allAccounts: null,
      creditorAccount: null,
      creditorAccounts: null,
      debitorAccount: null,
      debitorAccounts: null,
      dataLoaded: false,
      loadingError: false,
      life: null,
      monthlyInstallment: null,
      rateOfInterest: null,
      reference: null,
      targetAmount: null,
      targetDate: null,
      title: '',
    }
  },

  methods: {
    //TODO - i should move these get....() methods into the service or update the services, so I can call them from the created method
    async getData() {
      try {
        const accountsResult = accountService.getAll();

        let accounts = await accountsResult;
        this.allAccounts = accounts.map(b => { return { id: b.id, label: `${b.accountHolderName} (${b.iban})`, external: b.external} });
        this.creditorAccounts = copyService.copyArray(this.allAccounts);
        this.debitorAccounts = copyService.copyArray(this.allAccounts);

        this.dataLoaded = true;
      } catch (error) {
        console.error(error);
        throw new Error(error);
      }
    },

    onBlurCreditorAccount(event) {
      if (this.creditorAccount?.label !== event.target.value) {
        this.creditorAccount = null;
      }

      this.v$.creditorAccount.$touch()
    },

    onBlurDebitorAccount(event) {
      if (this.debitorAccount?.label !== event.target.value) {
        this.debitorAccount = null;
      }

      this.v$.debitorAccount.$touch()
    },

    pickItem(id, prop) {
      this[prop] = this[`${prop}s`].find(p => p.id == id);
    },

    async saveLoan() {
      try {
        const newLoan = {
          amount: this.amount,
          balance: this.amount,
          creditorBankAccountId: this.creditorAccount.id,
          debitorBankAccountId: this.debitorAccount.id,
          life: this.life,
          monthlyInstallment: this.monthlyInstallment,
          rateOfInterest: this.rateOfInterest,
          reference: this.reference,
          startDate: new Date().toISOString(),
        };

        await loanService.create(newLoan);
        this.$router.push('/debt-manager');
      }
      catch (error) {
        console.error('Error while creating new loan');
        console.error(error);
      }
    },

    updateAccounts(propToCheck, propToUpdate) {
      if (this[propToCheck] && this[propToCheck].external) {
        this[propToUpdate] = this.allAccounts.filter(a => !a.external);
      }
      else if (!this[propToCheck]) {
        this[propToUpdate] = copyService.copyArray(this.allAccounts);
      }
    },
  },

  setup() {
    return {
      v$: useVuelidate(),
    };
  },

  validations() {
    return loanValidation;
  }
};

</script>