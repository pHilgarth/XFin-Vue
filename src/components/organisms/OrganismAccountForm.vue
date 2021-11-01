<template>
<!-- TODO rework class structure of elements (ie here its .account-form -xfin-account-form) - don't remove this comment before all classes in project are updated, deleted, etc....-->
    <div class="account-form">
        <h1>Konto hinzufügen</h1>
        <form class="xfin-account-form">
            <MoleculeInputText field="IBAN" :hasErrors="ibanErrors || duplicate" v-model="iban" @blur="v$.iban.$touch()" :validation="v$.iban" />
            <p class="xfin-account-form__duplicate-account xfin-form__error" v-if="duplicate">
              Diese Iban existiert bereits!
            </p>
            <MoleculeInputText field="BIC" :hasErrors="bicErrors" v-model="bic" @blur="v$.bic.$touch()" :validation="v$.bic" />
            <MoleculeInputText field="Bank" v-model="bank" :optional="true" />
            <MoleculeInputText field="Beschreibung" v-model="description" :optional="true" />
            <MoleculeInputText v-if="newAccount" field="Kontostand" :hasErrors="balanceErrors" v-model="balance" @blur="v$.balance.$touch()" :validation="v$.balance" />

            <AtomButton classList="xfin-form__button" text="Konto speichern" :disabled="v$.$silentErrors.length || duplicate ? true : false" @click.prevent="save" />
            <AtomButton classList="xfin-form__button" text="Abbrechen" @click.prevent="$emit('cancel')" />
        </form>
    </div>
</template>

<script>
import { useVuelidate }                 from '@vuelidate/core';
import {
  newAccountValidation,
  existingAccountValidation }           from '@/validation/validations';
import { ibanDuplicateValidator }       from '@/validation/custom-validators';

import { InternalBankAccountService }   from '@/services/internal-bank-account-service';
import { NumberService}                 from '@/services/number-service';

import AtomButton                       from '@/components/atoms/AtomButton';
import MoleculeInputText                from '@/components/molecules/MoleculeInputText';

export default {
  created() {
    if (this.formData.account) {
      const ibanIndex = this.formData.ibans.findIndex(i => i === this.formData.account.iban);
      let ibans = this.formData.ibans;
      ibans.splice(ibanIndex, 1);
    }

    if (this.newAccount) {
      newAccountValidation.iban.ibanDuplicate = ibanDuplicateValidator(this.formData.ibans);

      //i have to remove the validator because I only need it, when creating a new account
      //delete newAccountValidation.iban.ibanDuplicate;

      //i need to instantiate the ibanDuplicate validator in here, because only here I can pass the ibans array
      // if (!this.formData.account) {
      //   newAccountValidation.iban.ibanDuplicate = ibanDuplicateValidator(this.formData.ibans);
      // }
      // else {
      //   const ibanIndex = this.formData.ibans.findIndex(i => i === this.formData.account.iban);
      //   let ibans = this.formData.ibans;
      //   ibans.splice(ibanIndex, 1);
      //
      //   newAccountValidation.iban.ibanDuplicate = ibanDuplicateValidator(this.formData.ibans);
      // }
    }
    else {
      existingAccountValidation.iban.ibanDuplicate = ibanDuplicateValidator(this.formData.ibans);
    }
  },

  components: {
    AtomButton,
    MoleculeInputText,
  },

  props: {
    formData:         { type: Object, required: true },
    newAccount:       { type: Boolean, default: true },
  },

  data() {
    return {
      id:             this.formData.account?.id || null,
      balance:        this.formData.account?.balance
                        ? NumberService.amountToString(this.formData.account.balance)
                        : null,
      bank:           this.formData.account?.bank || '',
      description:    this.formData.account?.description || '',
      bic:            this.formData.account?.bic || '',
      iban:           this.formData.account?.iban || '',

      ibans:          this.formData.account?.ibans || [],
      duplicate:      false,
    };
  },

  computed: {
    balanceErrors() { return this.v$.balance.$error; },
    bicErrors()     { return this.v$.bic.$error; },
    ibanErrors()    { return this.v$.iban.$error || this.ibans.includes(this.iban); },
  },

  watch: {
    iban()          {
                      this.v$.iban.$touch();
                      this.duplicate = false
                    },
    bic()           { this.v$.bic.$touch(); },
    balance()       { this.v$.balance.$touch(); },
  },

  setup() {
    return          { v$: useVuelidate(), };
  },

  validations() { return this.newAccount ? newAccountValidation : existingAccountValidation; },

  methods: {
    async save() {
      //TODO - error occurs when no changes are made, because the iban obviously exists on a persisted account
      const duplicate = await InternalBankAccountService.getByIban(this.id || 0, this.iban);

      if (!duplicate) {
        const account = {
          id: this.id,
          bank: this.bank,
          description: this.description,
          bic: this.bic,
          iban: this.iban,
        };

        //TODO - check if balance is passed when editing an existing account (existing in db)
        //TODO - it might get lost, because it's not in the 'account' declaration on ln101
        if (this.newAccount) {
          account.balance = NumberService.parseFloat(this.balance);
          account.index = this.formData.account?.index;
        }

        this.$emit('save', account);
      }
      else {
        this.duplicate = true;
      }
    },
  },
};
</script>