<template>
  <div class="organism-external-party-form">
    <div class="organism-external-party-form__inner">
      <AtomHeadline tag="h1" text="Externen Zahlungspartner anlegen" />
      <form>
        <MoleculeInputText class="pb-5" field="name" :hasErrors="nameErrors || nameDuplicate" v-model="name" @blur="v$.name.$touch()" :validation="v$.name" label="Name" />
        <AtomParagraph v-if="nameDuplicate" class="organism-external-party-form__duplicate-account xfin__form__error" text="Dieser Name existiert bereits!" />
        <MoleculeInputText class="pb-5" field="iban" :hasErrors="ibanErrors || ibanDuplicate" v-model="iban" @blur="v$.iban.$touch()" :validation="v$.iban" label="IBAN" />
        <AtomParagraph v-if="ibanDuplicate" class="organism-external-party-form__duplicate-account xfin__form__error" text="Diese Iban existiert bereits!" />
        <MoleculeInputText class="pb-5" field="bic" :hasErrors="bicErrors" v-model="bic" @blur="v$.bic.$touch()" :validation="v$.bic" label="BIC" />

        <AtomButton text="Speichern" :disabled="v$.$silentErrors.length > 0 || nameDuplicate || ibanDuplicate" type="primary" @click.prevent="save" />
        <AtomButton text="Abbrechen" type="cancel" @click.prevent="$emit('cancel')" />
        <AtomParagraph v-if="duplicateCheckError" text="Speichern nicht möglich!" class="mt-3 xfin__form__error"/>
      </form>
    </div>
  </div>
</template>

<script>
import { useVuelidate } from "@vuelidate/core";

import { ibanDuplicateValidator } from "@/validation/custom-validators";

import { BankAccountService } from "@/services/bank-account-service";
import { NumberService } from "@/services/number-service";

import AtomButton from '@/components/atoms/AtomButton';
import AtomHeadline from "@/components/atoms/AtomHeadline";
import AtomParagraph from '@/components/atoms/AtomParagraph';
import MoleculeInputText from "@/components/molecules/MoleculeInputText";

import { accountValidation } from "@/validation/validations";

export default {
  components: {
    AtomButton,
    AtomHeadline,
    AtomParagraph,
    MoleculeInputText,
  },

  props: {
    ibans: { type: Array, required: true },
    names: { type: Array, required: true },
  },

  data() {
    return {
      bic:                    null,
      iban:                   null,
      //ibans:                  null,
      name:                   null,
      //names:                  null, //TODO - what should that be?
      duplicateCheckError:    false,
    };
  },

  computed: {
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
    },
    bic() {
      this.bic = this.bic.toUpperCase();
      this.v$.bic.$touch();
    },
  },

  setup() {
    return { v$: useVuelidate() };
  },

  validations() {
    accountValidation.iban.ibanDuplicate = ibanDuplicateValidator(this.ibans);
    return accountValidation;
  },

  methods: {
    async save() {
      try {
        const bankAccountDuplicate = await BankAccountService.getSingleByIban(this.iban);

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
          this.ibanDuplicate = true;
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