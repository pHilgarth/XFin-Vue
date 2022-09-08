<template>
    <div class="organism-account-form">
      <div class="organism-account-form__inner">
        <AtomHeadline tag="h1" :text="headline" />
        <form>
          <MoleculeInputText class="pb-5" field="iban" :hasErrors="ibanErrors || duplicate" v-model="iban" @blur="v$.iban.$touch()" :validation="v$.iban" label="IBAN" />
          <AtomParagraph v-if="duplicate" class="organism-account-form__duplicate-account xfin__form__error" text="Diese Iban existiert bereits!" />
          <MoleculeInputText class="pb-5" field="bic" :hasErrors="bicErrors" v-model="bic" @blur="v$.bic.$touch()" :validation="v$.bic" label="BIC" />
          <MoleculeInputText class="pb-5" field="bank" v-model="bank" :optional="true" label="Bank" />
          <MoleculeInputText class="pb-5" field="description" v-model="description" :optional="true" label="Beschreibung" />
          <MoleculeInputText class="pb-5" v-if="!formData.account || formData.account.isNew" field="balance" :hasErrors="balanceErrors" v-model="balance" :validation="v$.balance"
                             label="Kontostand" @blur="v$.balance.$touch()" />

          <AtomButton text="Konto speichern" :disabled="v$.$silentErrors.length > 0 || duplicate" type="primary" @click.prevent="save" />
          <AtomButton text="Abbrechen" type="cancel" @click.prevent="$emit('cancel')" />
          <AtomParagraph v-if="duplicateCheckError" text="Speichern nicht möglich!" class="mt-3 xfin__form__error"/>
        </form>
      </div>
    </div>
</template>

<script>
import { useVuelidate } from "@vuelidate/core";

import {
  ibanDuplicateValidator,
  balanceValidator,
} from "@/validation/custom-validators";

import { bankAccountService } from "@/services/bank-account-service";
import { NumberService } from "@/services/number-service";

import AtomButton from '@/components/atoms/AtomButton';
import AtomHeadline from "@/components/atoms/AtomHeadline";
import AtomParagraph from '@/components/atoms/AtomParagraph';
import MoleculeInputText from "@/components/molecules/MoleculeInputText";

import { accountValidation } from "@/validation/validations";

export default {
  created() {
    //if formData has an account property, the user is editing an existing account (existing in memory or in db) and I remove its iban from the
    //duplicate checklist - I need an extra variable since I cant mutate props directly
    if (this.formData.account) {
      const ibanIndex = this.formData.ibans.findIndex(i => i === this.formData.account.iban);
      let ibans = this.formData.ibans;
      ibans.splice(ibanIndex, 1);
    }
  },

  components: {
    AtomButton,
    AtomHeadline,
    AtomParagraph,
    MoleculeInputText,
  },

  props: {
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
      description:            this.formData.account?.description || null,
      bic:                    this.formData.account?.bic || "",
      originalIban:           this.formData.account?.iban || "",
      iban:                   this.formData.account?.iban || "",

      ibans:                  this.formData.account?.ibans || [],
      duplicate:              false,
      duplicateCheckError:    false,
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
      this.iban = this.iban.toUpperCase();
      this.v$.iban.$touch();
      this.duplicate = false;
    },
    bic() {
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
    if (!this.formData.account || this.formData.account.isNew) {
      accountValidation.balance = { balanceValidator };
    }

    accountValidation.iban.ibanDuplicate = ibanDuplicateValidator(this.formData.ibans);
    return accountValidation;
  },

  methods: {
    async save() {
      try {
        const bankAccountDuplicate = await bankAccountService.getSingleByIban(this.iban);

        if (!bankAccountDuplicate) {
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
        else {
          this.duplicate = true;
        }
      } catch (error) {
        console.error('could not check for duplicates! Aborting!');
        console.error(error);
        this.duplicateCheckError = true;
      }
    },
  },
};
</script>