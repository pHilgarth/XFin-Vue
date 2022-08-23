<template>
  <div class="new-reserve">
    <AtomHeadline tag="h1" text="Rücklage anlegen" />
    <form>
      <MoleculeInputSelect class="new-reserve__account pb-5" :options="bankAccountOptions" field="account"
                           v-model="selectedAccountId" label="Konto"/>

      <!-- TODO - I need to check for duplicated reserve titles in the database -->
      <MoleculeInputText class="pb-5" field="title" :hasErrors="v$.title.$error" v-model="title" @blur="v$.title.$touch()" :validation="v$.title" label="Titel" />
<!--      <AtomParagraph v-if="duplicate" class="new-reserve__duplicate-title xfin__form__error" text="Dieser Titel existiert bereits!" />-->

      <MoleculeInputText class="pb-5" field="targetAmount" :hasErrors="v$.targetAmount.$error" v-model="targetAmount" :validation="v$.targetAmount"
                         label="Zielbetrag" @blur="v$.targetAmount.$touch()" />

      <Datepicker class="vuepic-datepicker pb-5" v-model="targetDate" placeholder="Zieldatum" locale="de" :minDate="new Date()" :enableTimePicker="false" autoApply />

      <AtomButton type="primary" text="Speichern" @click.prevent="saveReserve"/>

<!--      <AtomButton text="Konto speichern" :disabled="v$.$silentErrors.length > 0 || duplicate" type="primary" @click.prevent="save" />-->
<!--      <AtomButton text="Abbrechen" type="cancel" @click.prevent="$emit('cancel')" />-->
    </form>

    <pre>{{selectedAccountId}}</pre>
    <pre>{{title}}</pre>
    <pre>{{targetAmount}}</pre>
    <pre>{{targetDate}}</pre>
  </div>
</template>

<script>

import Datepicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css'

import { useVuelidate } from "@vuelidate/core";

import AtomButton from '@/components/atoms/AtomButton';
import AtomHeadline from '@/components/atoms/AtomHeadline';

import MoleculeInputSelect from '@/components/molecules/MoleculeInputSelect';
import MoleculeInputText from '@/components/molecules/MoleculeInputText';

import { AccountHolderService } from '@/services/account-holder-service';
import { ReserveService } from '@/services/reserve-service';
import { reserveValidation } from "@/validation/validations";

export default {
  components: {
    Datepicker,
    AtomButton,
    AtomHeadline,
    MoleculeInputSelect,
    MoleculeInputText,
  },

  //TODO - tweak this error handling -  it is so ugly
  async created() {
    let apiResponse = await this.getAccountHolders();

    if (apiResponse.success) {
      this.dataLoaded = true;
    } else {
      this.loadingError = true;
      console.error(apiResponse.error);
    }
  },

  data() {
    return {
      accountHolders: null,
      bankAccountOptions: null,
      selectedAccountId: -1,
      targetAmount: null,
      targetDate: null,
      title: '',
    }
  },

  methods: {
    //TODO - i should move these get....() methods into the service or update the services, so I can call them from the created method
    async getAccountHolders() {
      const includeBankAccounts = true;
      const apiResponse = await AccountHolderService.getAllByUser(includeBankAccounts);

      if (apiResponse.success && apiResponse.data) {
        this.accountHolders = apiResponse.data;
        this.bankAccountOptions = [];
        this.selectedAccountId = this.accountHolders[0].bankAccounts[0].id;

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
          });
        });
      } else if (apiResponse.success && !apiResponse.data) {
        this.accountHolders = [];
      }

      return apiResponse;
    },

    async saveReserve() {
      const newReserve = {
        internalBankAccountId: this.selectedAccountId,
        title: this.title,
        targetAmount: this.targetAmount,
        targetDate: this.targetDate?.toISOString() || null,
      };
      console.log(newReserve);

      const createdReserve = await ReserveService.create(newReserve);
      console.log(createdReserve);

    },
  },

  setup() {
    return {
      v$: useVuelidate(),
    };
  },

  validations() {
    return reserveValidation;
  }
};

</script>