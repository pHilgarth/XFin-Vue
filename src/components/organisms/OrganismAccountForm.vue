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
            <MoleculeInputText classList="pb-5" field="bic" :hasErrors="bicErrors" v-model="bic" @blur="v$.bic.$touch()" :validation="v$.bic" label="BIC" />
            <MoleculeInputText classList="pb-5" field="bank" v-model="bank" :optional="true" label="Bank" />
            <MoleculeInputText classList="pb-5" field="description" v-model="description" :optional="true" label="Beschreibung" />
            <MoleculeInputText classList="pb-5" v-if="!formData.account || formData.account.isNew" field="balance" :hasErrors="balanceErrors" v-model="balance" @blur="v$.balance.$touch()" :validation="v$.balance" label="Kontostand" />

            <!-- TODO - remove border on button-->
            <AtomButton text="Konto speichern" :disabled="v$.$silentErrors.length > 0 || duplicate" @click.prevent="save" />
            <AtomButton text="Abbrechen" @click.prevent="$emit('cancel')" />
        </form>
    </div>
</template>

<script>
import { useVuelidate } from "@vuelidate/core";

import { ibanDuplicateValidator } from "@/validation/custom-validators";

import { InternalBankAccountService } from "@/services/internal-bank-account-service";
import { NumberService } from "@/services/number-service";

import AtomButton from "@/components/atoms/AtomButton";
import AtomHeadline from "@/components/atoms/AtomHeadline";
import MoleculeInputText from "@/components/molecules/MoleculeInputText";

import {
  newAccountValidation,
  existingAccountValidation,
} from "@/validation/validations";

export default {
  created() {
    //if formData has an account property, the user is editing an existing account (existing in memory or in db) and I remove its iban from the
    //duplicate checklist - I need an extra variable since I cant mutate props directly
    if (this.formData.account) {
      const ibanIndex = this.formData.ibans.findIndex(i => i === this.formData.account.iban);
      let ibans = this.formData.ibans;
      ibans.splice(ibanIndex, 1);
    }

//TODO - maybe I can place this if else in the 'validations'-section?
    if (!this.formData.account) {
      newAccountValidation.iban.ibanDuplicate = ibanDuplicateValidator(this.formData.ibans);
    } else {
      existingAccountValidation.iban.ibanDuplicate = ibanDuplicateValidator(this.formData.ibans);
    }
  },

  components: {
    AtomButton,
    AtomHeadline,
    MoleculeInputText,
  },

  props: {
    /**
     * formData holds the required data for the account form
     *    { account:  Object,       => if editing an existing account
     *      ibans:    Array,        => holds the ibans for the client-side iban-duplicate check
     *    }
     */
    formData: { type: Object, required: true },
    headline: { type: String, required: true },
  },

  data() {
    return {
      accountIndex:           this.formData.accountIndex,
      accountNumber:          this.formData.account?.accountNumber || null,
      id:                     this.formData.account?.id || null,
      accountHolderId:        this.formData.account?.accountHolderId || null,
      balance:                this.formData.account?.balance
                                ? NumberService.amountToString(this.formData.account.balance)
                                : null,
      bank:                   this.formData.account?.bank || "",
      description:            this.formData.account?.description || "",
      bic:                    this.formData.account?.bic || "",
      originalIban:           this.formData.account?.iban || "",
      iban:                   this.formData.account?.iban || "",

      ibans:                  this.formData.account?.ibans || [],
      duplicate:              false,
    };
  },

  computed: {
    balanceErrors() {
      return this.v$.balance.$error;
    },
    bicErrors() {
      return this.v$.bic.$error;
    },
    ibanErrors() {
      return this.v$.iban.$error || this.ibans.includes(this.iban);
    },
  },

  watch: {
    iban() {
      //TODO - add this next line to every iban field watcher in other components and remove 'toUpperCase' afterwards where it's no longer needed
      this.iban = this.iban.toUpperCase();
      this.v$.iban.$touch();
      this.duplicate = false;
    },
    bic() {
      //TODO - add this next line to every bic field watcher in other components and remove 'toUpperCase' afterwards where it's no longer needed
      this.bic = this.bic.toUpperCase();
      this.v$.bic.$touch();
    },
    balance() {
      this.v$.balance.$touch();
    },
  },

  setup() {
    return { v$: useVuelidate() };
  },

  validations() {
    return !this.formData.account || this.formData.account.isNew
      ? newAccountValidation
      : existingAccountValidation;
  },

  methods: {
    async save() {
      // TODO - delete console log
      console.log('save invoked!');
      let duplicateCheckResponse = null;
      //if iban changed, check for duplicates in the db
      if (this.originalIban !== this.iban) {
         duplicateCheckResponse = await InternalBankAccountService.getByIban(this.iban);
      }

      if ((duplicateCheckResponse === null) || duplicateCheckResponse.success && !duplicateCheckResponse.duplicate) {
        const account = {
          id: this.id,
          bank: this.bank,
          description: this.description,
          bic: this.bic,
          iban: this.iban,
          accountNumber: NumberService.getAccountNumber(this.iban),
          balance: NumberService.parseFloat(this.balance),
          index: this.accountIndex,
        };
      
        this.$emit("save", account);
      }
      else if (duplicateCheckResponse.success && duplicateCheckResponse.duplicate) {
        this.duplicate = true;
      }
      else if (!duplicateCheckResponse.success) {
        //TODO - show something in frontend
        alert('Error during duplicate check');
        console.error(duplicateCheckResponse.error);
      }
    },
  },
};
</script>