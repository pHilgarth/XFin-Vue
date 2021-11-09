<template>
<!-- TODO rework class structure of elements (ie here its .account-form -xfin-account-form) - don't remove this comment before all classes in project are updated, deleted, etc....-->
    <div class="account-form">
      <AtomHeadline tag="h1" :text="headline" />
        <form class="xfin-account-form">
          <!-- TODO - add padding-classes to every molecule, atom, etc .... check every form and add it where its missing -->
            <MoleculeInputText classList="pb-5" field="iban" :hasErrors="ibanErrors || duplicate" v-model="iban" @blur="v$.iban.$touch()" :validation="v$.iban" label="IBAN" />
            <p class="xfin-account-form__duplicate-account xfin-form__error" v-if="duplicate">
              Diese Iban existiert bereits!
            </p>
            <MoleculeInputText field="bic" :hasErrors="bicErrors" v-model="bic" @blur="v$.bic.$touch()" :validation="v$.bic" label="BIC" />
            <MoleculeInputText field="bank" v-model="bank" :optional="true" label="Bank" />
            <MoleculeInputText field="description" v-model="description" :optional="true" label="Beschreibung" />
            <MoleculeInputText v-if="newAccount" field="balance" :hasErrors="balanceErrors" v-model="balance" @blur="v$.balance.$touch()" :validation="v$.balance" label="Kontostand" />

            <AtomButton classList="xfin-form__button" text="Konto speichern" :disabled="v$.$silentErrors.length || duplicate ? true : false" @click.prevent="save" />
            <AtomButton classList="xfin-form__button" text="Abbrechen" @click.prevent="$emit('cancel')" /><p>{{ formData.ibans }}</p>
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
import AtomHeadline                     from '@/components/atoms/AtomHeadline';
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

      //TODO - can I remove this commented section? Test, if everything works without it
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
    AtomHeadline,
    MoleculeInputText,
  },

  props: {
    //TODO - create a documentation for what formData should look like
    formData:         { type: Object, required: true },
    newAccount:       { type: Boolean, default: true },
    headline:         { type: String, required: true },
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
      //TODO - update this method and the endpoint on the API to use only the iban, i dont need the id here
      //TODO - i will need to update the route on the API, just add /iban/{iban}
      const duplicate = await InternalBankAccountService.getByIban(this.id || 0, this.iban);

      if (!duplicate) {
        const account = {
          id: this.id,
          bank: this.bank,
          description: this.description,
          bic: this.bic.toUpperCase(),
          iban: this.iban.toUpperCase(),
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