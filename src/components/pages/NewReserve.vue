<template>
  <div class="new-reserve">
    <AtomHeadline tag="h1" text="Rücklage anlegen" />

    <MoleculeLoading v-if="!dataLoaded" :loadingError="loadingError" errorMessage="Fehler beim Laden der Daten!"/>

    <form v-else>
      <div class="pb-5">
        <MoleculeInputAutoSuggest field="bank-account" v-model="bankAccount" label="Konto" :required="true" :items="bankAccounts" :validation="v$.bankAccount"
                                  :hasErrors="v$.bankAccount?.$error" @blur="v$.bankAccount.$touch()" @itemPicked="pickItem($event, 'bankAccount')"/>
      </div>

      <div class="pb-5">
        <MoleculeInputAutoSuggest field="cost-center" v-model="costCenter" label="Kostenstelle" :required="true" :items="costCenters" :validation="v$.costCenter"
                                  :hasErrors="v$.costCenter.$error" @blur="v$.costCenter.$touch()" @itemPicked="pickItem($event, 'costCenter')"/>
      </div>

      <!-- TODO - I need to check for duplicated reserve titles in the database -->
      <MoleculeInputText class="pb-5" field="title" :hasErrors="v$.title.$error" v-model="title" :required="true"
                         @blur="v$.title.$touch()" :validation="v$.title" label="Titel" />
<!--      <AtomParagraph v-if="duplicate" class="new-reserve__duplicate-title xfin__form__error" text="Dieser Titel existiert bereits!" />-->

      <MoleculeInputText class="pb-5" field="targetAmount" :hasErrors="v$.targetAmount.$error" v-model="targetAmount" :validation="v$.targetAmount"
                         label="Zielbetrag" @blur="v$.targetAmount.$touch()" />

      <Datepicker class="vuepic-datepicker pb-5" v-model="targetDate" placeholder="Zieldatum" locale="de" :minDate="new Date()" :enableTimePicker="false" autoApply />

      <AtomButton type="primary" text="Speichern" @click.prevent="saveReserve" :disabled="v$.$silentErrors.length"/>

<!--      <AtomButton text="Konto speichern" :disabled="v$.$silentErrors.length > 0 || duplicate" type="primary" @click.prevent="save" />-->
<!--      <AtomButton text="Abbrechen" type="cancel" @click.prevent="$emit('cancel')" />-->
    </form>
    {{ bankAccount }}
  </div>
</template>

<script>

import Datepicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css'

import { useVuelidate } from "@vuelidate/core";

import AtomButton from '@/components/atoms/AtomButton';
import AtomHeadline from '@/components/atoms/AtomHeadline';

import MoleculeInputAutoSuggest from '@/components/molecules/MoleculeInputAutoSuggest';
import MoleculeInputText from '@/components/molecules/MoleculeInputText';
import MoleculeLoading from '@/components/molecules/MoleculeLoading';

import { BankAccountService } from '@/services/bank-account-service';
import { costCenterService } from '@/services/cost-center-service';
import { reserveService } from '@/services/reserve-service';
import { reserveValidation } from "@/validation/validations";

export default {
  components: {
    Datepicker,
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
    targetAmount() {
      this.v$.targetAmount.$touch();
    }
  },

  data() {
    return {
      accountHolders: null,
      bankAccount: null,
      bankAccounts: null,
      costCenter: null,
      costCenters: null,
      dataLoaded: false,
      loadingError: false,
      targetAmount: null,
      targetDate: null,
      title: '',
    }
  },

  methods: {
    //TODO - i should move these get....() methods into the service or update the services, so I can call them from the created method
    async getData() {
      try {
        const bankAccountsResult = BankAccountService.getAll();
        let costCentersResult = costCenterService.getAll();

        let bankAccounts = await bankAccountsResult;
        bankAccounts = bankAccounts.filter(b => !b.external).map(
            b => { return { id: b.id, label: `${b.accountHolderName} (${b.iban})`} });

        let costCenters = await costCentersResult;

        this.bankAccounts = bankAccounts;
        this.costCenters = costCenters.filter(c => c.name !== 'Nicht zugewiesen').map(c => {
          return { id: c.id, label: c.name }
        });

        this.dataLoaded = true;
      } catch (error) {
        console.error(error);
        throw new Error(error);
      }
    },

    pickItem(id, prop) {
      this[prop] = this[`${prop}s`].find(p => p.id == id);
    },

    async saveReserve() {
      const newReserve = {
        bankAccountId: this.bankAccount.id,
        costCenterId: this.costCenter.id,
        reference: this.title,
        targetAmount: this.targetAmount,
        targetDate: this.targetDate?.toISOString() || null,
      };

      console.log(newReserve);

      const createdReserve = await reserveService.create(newReserve);
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