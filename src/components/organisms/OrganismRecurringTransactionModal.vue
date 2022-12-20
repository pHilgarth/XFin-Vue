<template>
  <div class="organism-recurring-transaction-modal">
    <div class="organism-recurring-transaction-modal__inner">
      <AtomHeadline tag="h1" text="Transaktionsdetails" />
      <MoleculeRecurringTransactionDetails :transaction="transaction"/>
      <form>
        <MoleculeInputText class="pb-5" field="reference" label="Name" v-model="reference" :validation="v$.reference" :hasErrors="v$.reference.$error"
                           @blur="v$.reference.$touch()"  />

        <MoleculeInputText class="pb-5" field="amount" label="Betrag" v-model="amount" :validation="v$.amount" :hasErrors="v$.amount.$error"
                           @blur="v$.amount.$touch()" />

        <AtomButton :text="editOnce ? 'Verbuchen' : 'Speichern'" :disabled="v$.$silentErrors.length > 0" type="primary" @click.prevent="save" />
        <AtomButton text="Abbrechen" type="cancel" @click.prevent="$emit('cancel')" />
      </form>
    </div>

  </div>
</template>

<script>
import AtomButton from "../atoms/AtomButton";
import AtomHeadline from "../atoms/AtomHeadline";
import MoleculeInputText from "../molecules/MoleculeInputText";
import MoleculeRecurringTransactionDetails from '@/components/molecules/MoleculeRecurringTransactionDetails';

import { copyService } from '@/services/copy-service';
import { numberService } from '@/services/number-service';

import { recurringTransactionValidation } from '@/validation/validations';

import useVuelidate from "@vuelidate/core";

export default {
  props: {
    transaction: { type: Object, required: true },
    //if true, the recurringTransaction is executed with the updated data once, if false, the updated data is stored to the database
    editOnce: { type: Boolean, default: false },
  },

  components: {
    AtomButton,
    AtomHeadline,
    MoleculeInputText,
    MoleculeRecurringTransactionDetails,
  },

  watch: {
    amount() {
      this.v$.amount.$touch();
    },

    reference() {
      this.v$.amount.$touch();
    },
  },

  data() {
    return {
      amount: numberService.amountToString(this.transaction.amount),
      reference: this.transaction.reference,
      updatedTransaction: copyService.copyObject(this.transaction),
    };
  },

  methods: {
    save() {
      this.updatedTransaction.amount = numberService.parseFloat(this.amount);
      this.updatedTransaction.reference = this.reference;

      this.$emit('save', this.updatedTransaction);
    },
  },

  setup() {
    return {
      v$: useVuelidate(),
    };
  },

  validations() {
    return recurringTransactionValidation;
  },
}
</script>