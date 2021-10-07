<template>
    <div class="account-form">
        <h1>Konto hinzufügen</h1>{{ formData || 'null' }}
        <form class="xfin-form">
            <MoleculeInputText field="IBAN" :hasErrors="ibanErrors" v-model="iban" @blur="v$.iban.$touch()" :validation="v$.iban" />
            <MoleculeInputText field="BIC" :hasErrors="bicErrors" v-model="bic" @blur="v$.bic.$touch()" :validation="v$.bic" />
            <MoleculeInputText field="Bank" v-model="bank" :optional="true" />
            <MoleculeInputText field="Beschreibung" v-model="description" :optional="true" />
            <MoleculeInputText field="Kontostand" :hasErrors="balanceErrors" v-model="balance" @blur="v$.balance.$touch()" :validation="v$.balance" />

            <AtomButton classList="xfin-form__button" text="Konto speichern" :disabled="v$.$silentErrors.length ? true : false" @click.prevent="save" />
            <AtomButton classList="xfin-form__button" text="Abbrechen" @click.prevent="$emit('cancel')" />
        </form>
    </div>
</template>

<script>
import { useVuelidate } from '@vuelidate/core';
import { accountValidation } from '@/validation/validations';
import { ibanDuplicateValidator } from '@/validation/custom-validators';

import { InternalBankAccountService } from '@/services/internal-bank-account-service';
import { NumberService} from '@/services/number-service';

import AtomButton from '@/components/atoms/AtomButton';
import MoleculeInputText from '@/components/molecules/MoleculeInputText';

export default {
  created() {
    //i have to remove the validator because I only need it, when creating a new account
    delete accountValidation.iban.ibanDuplicate;

    //i need to instantiate the ibanDuplicate validator in here, because only here I can pass the ibans array
    if (!this.formData.account) {
      accountValidation.iban.ibanDuplicate = ibanDuplicateValidator(this.formData?.ibans);
    }
    else {
      const ibanIndex = this.formData.ibans.findIndex(i => i === this.formData.account.iban);
      let ibans = this.formData.ibans;
      ibans.splice(ibanIndex, 1);

      accountValidation.iban.ibanDuplicate = ibanDuplicateValidator(this.formData?.ibans);
    }
  },

  components: {
    AtomButton,
    MoleculeInputText,
  },

  props: {
    formData: { type: Object },
  },

  data() {
    return {
      accountNumber:  this.formData?.account?.accountNumber || null,
      balance:        this.formData?.account
                        ? NumberService.amountToString(this.formData.account.balance)
                        : '',
      bank:           this.formData?.account?.bank || '',
      description:    this.formData?.account?.description || '',
      bic:            this.formData?.account?.bic || '',
      iban:           this.formData?.account?.iban || '',
      ibans:          this.formData?.account?.ibans || [],
    };
  },

  computed: {
    balanceErrors() { return this.v$.balance.$error; },
    bicErrors()     { return this.v$.bic.$error; },
    ibanErrors()    { return this.v$.iban.$error || this.ibans.includes(this.iban); },
  },

  watch: {
    iban()          { this.v$.iban.$touch(); },
    bic()           { this.v$.bic.$touch(); },
    balance()       { this.v$.balance.$touch(); },
  },

  setup() {
    return          { v$: useVuelidate(), };
  },

  validations() { return accountValidation; },

  methods: {
    async save() {
      const duplicate = await InternalBankAccountService.getByIban(this.iban);

      if (!duplicate) {
        this.$emit('save', {
          accountNumber: this.accountNumber,
          balance: NumberService.parseFloat(this.balance),
          bank: this.bank,
          description: this.description,
          bic: this.bic,
          iban: this.iban,
          });
      }
      else {
        //TODO - implement error message
      }
    },
  },
};
</script>