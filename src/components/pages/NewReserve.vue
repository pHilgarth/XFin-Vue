<template>
  <div class="new-reserve">
    <AtomHeadline tag="h1" text="Rücklage anlegen" />

    <MoleculeLoading v-if="!dataLoaded" :loadingError="loadingError" errorMessage="Fehler beim Laden der Daten!"/>

    <form v-else>
      <div class="pb-5">
        <MoleculeInputAutoSuggest field="bank-account" v-model="bankAccount" label="Konto" :required="true" :items="bankAccounts" :validation="v$.bankAccount"
                                  :hasErrors="v$.bankAccount?.$error" @blur="onBlurBankAccount" @itemPicked="pickItem($event, 'bankAccount')"/>
      </div>

      <div class="pb-5">
        <MoleculeInputAutoSuggest field="cost-center" v-model="costCenter" label="Kostenstelle" :required="true" :items="costCenters" :validation="v$.costCenter"
                                  :hasErrors="v$.costCenter.$error" @blur="onBlurCostCenter" @itemPicked="pickItem($event, 'costCenter')"/>
      </div>

      <!-- TODO - I need to check for duplicated reserve references in the database -->
      <MoleculeInputText class="pb-5" field="reference" :hasErrors="v$.reference.$error" v-model="reference" :required="true"
                         @blur="v$.reference.$touch()" :validation="v$.reference" label="Titel" />
<!--      <AtomParagraph v-if="duplicate" class="new-reserve__duplicate-reference xfin__form__error" text="Dieser Titel existiert bereits!" />-->

      <MoleculeInputText class="pb-5" field="targetAmount" :hasErrors="v$.targetAmount.$error" v-model="targetAmount" :validation="v$.targetAmount"
                         label="Zielbetrag" @blur="v$.targetAmount.$touch()" />

      <Datepicker class="vuepic-datepicker pb-5" v-model="targetDate" placeholder="Zieldatum" locale="de" :minDate="new Date()" :enableTimePicker="false" autoApply />

      <AtomButton type="primary" text="Speichern" @click.prevent="saveReserve" :disabled="v$.$silentErrors.length"/>
      <AtomButton text="Abbrechen" type="cancel" @click.prevent="$router.push('/reserves')" />
    </form>
  </div>
</template>

<script>

import Datepicker from '@vuepic/vue-datepicker';

import { useVuelidate } from "@vuelidate/core";

import AtomButton from '@/components/atoms/AtomButton';
import AtomHeadline from '@/components/atoms/AtomHeadline';

import MoleculeInputAutoSuggest from '@/components/molecules/MoleculeInputAutoSuggest';
import MoleculeInputText from '@/components/molecules/MoleculeInputText';
import MoleculeLoading from '@/components/molecules/MoleculeLoading';

import { accountService } from '@/services/account-service';
import { costCenterService } from '@/services/cost-center-service';
import { numberService } from '@/services/number-service';
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
      if (this.$cookies.get('user')) {
        this.user = this.$cookies.get('user');
      }

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
      reference: '',
      user: null,
    }
  },

  methods: {
    //TODO - i should move these get....() methods into the service or update the services, so I can call them from the created method
    async getData() {
      try {
        const bankAccountsResult = accountService.getAll();
        //TODO - does this work?
        let costCentersResult = costCenterService.getAllByUser(this.user.id);

        let bankAccounts = await bankAccountsResult;
        bankAccounts = bankAccounts.filter(b => !b.external).map(
            b => { return { id: b.id, label: `${b.accountHolderName} (${b.iban})`} });

        let costCenters = await costCentersResult;

        this.bankAccounts = bankAccounts;
        this.costCenters = costCenters.map(c => {
          return { id: c.id, label: c.name }
        });

        this.dataLoaded = true;
      } catch (error) {
        console.error(error);
        throw new Error(error);
      }
    },

    onBlurBankAccount(event) {
      if (this.bankAccount?.label !== event.target.value) {
        this.bankAccount = null;
      }

      this.v$.bankAccount.$touch()
    },

    onBlurCostCenter(event) {
      if (this.costCenter?.label !== event.target.value) {
        this.costCenter = null;
      }

      this.v$.costCenter.$touch()
    },

    pickItem(id, prop) {
      this[prop] = this[`${prop}s`].find(p => p.id == id);
    },

    async saveReserve() {
      try {
        const newReserve = {
          bankAccountId: this.bankAccount.id,
          costCenterId: this.costCenter.id,
          reference: this.reference,
          targetAmount: numberService.parseFloat(this.targetAmount),
          targetDate: this.targetDate?.toISOString() || null,
        };

        await reserveService.create(newReserve);
        this.$router.push('/reserves');
      }
      catch (error) {
        console.error('Error while creating new reserve');
        console.error(error);
      }
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

<style>
@import '~@vuepic/vue-datepicker/dist/main.css';
</style>