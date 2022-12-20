<template>
  <div class="organism-reserve-modal">
    <div class="organism-reserve-modal__inner">
      <AtomHeadline tag="h1" text="Rücklagendetails" />
      <!-- TODO move this table into its own file -->
      <table class="organism-reserve-modal__details">
        <tbody>
        <tr>
          <th>Konto</th>
          <td>{{ reserve.bankAccount.accountHolderName }}</td>
          <td></td>
        </tr>
        <tr>
          <th>Kostenstelle</th>
          <td>{{ reserve.costCenter.name }}</td>
          <td></td>
        </tr>
        <tr>
          <th>Verwendungszweck</th>
          <td>
            <MoleculeInputText field="reference" v-model="reference" label="Verwendungszweck" :small="true" :hasErrors="v$.reference.$error"
                               @blur="v$.reference.$touch()" />
          </td>
          <td v-if="v$.reference.$errors.length" class="organism-reserve-modal__error">
            <template v-for="(error, index) in v$.reference.$errors" :key="index">
              <MoleculeFormError :error="error" />
            </template>
          </td>
          <td v-else></td>
        </tr>
        <tr>
          <th>Zielbetrag</th>
          <td>
            <MoleculeInputText class="organism-reserve-details__target-amount" field="target-amount" v-model="targetAmount" label="Betrag" :small="true"
                               :hasErrors="v$.targetAmount.$error" @blur="v$.targetAmount.$touch()" />
          </td>
          <td v-if="v$.targetAmount.$errors.length" class="organism-reserve-modal__error">
            <template v-for="(error, index) in v$.targetAmount.$errors" :key="index">
              <MoleculeFormError :error="error" />
            </template>
          </td>
          <td v-else>
          </td>
        </tr>
        <tr>
          <th>Zieldatum</th>
          <td>
            <Datepicker class="vuepic-datepicker vuepic-datepicker--small" v-model="targetDate" placeholder="Zieldatum" locale="de"
                        format="dd.MM.yyyy" :minDate="new Date()" :enableTimePicker="false" autoApply />
          </td>
          <td></td>
        </tr>
        </tbody>
      </table>

      <OrganismCollapsibleWithSlot v-if="transactions.length" title="Transaktionen">
        <p>hier könnte ich einen Slider für die verschiedenen Monate einbauen, sonst sind es irgendwann sehr viele Transactions nach unten</p>
        <MoleculeReserveTransactions :transactions="transactions" :accountId="reserve.bankAccount.id"/>
      </OrganismCollapsibleWithSlot>
      <AtomButton type="primary" :disabled="v$.$silentErrors.length" text="Speichern" @click="save" />
      <AtomButton type="cancel" text="Abbrechen" @click="$emit('cancel')" />
    </div>
  </div>
</template>

<script>

import AtomButton from '@/components/atoms/AtomButton';
import AtomHeadline from '@/components/atoms/AtomHeadline';
import MoleculeFormError from '@/components/molecules/MoleculeFormError';
import MoleculeInputText from '@/components/molecules/MoleculeInputText';
import MoleculeReserveTransactions from "@/components/molecules/MoleculeReserveTransactions";
import OrganismCollapsibleWithSlot from "@/components/organisms/OrganismCollapsibleWithSlot";

import { numberService } from '@/services/number-service';

import { reserveEditValidation } from '@/validation/validations';

import Datepicker from '@vuepic/vue-datepicker';

import { useVuelidate } from "@vuelidate/core";

export default {
  components: {
    AtomButton,
    AtomHeadline,
    MoleculeFormError,
    MoleculeInputText,
    MoleculeReserveTransactions,
    OrganismCollapsibleWithSlot,
    Datepicker,
  },

  props: {
    reserve: { type: Object, required: true },
  },

  watch: {
    targetAmount() {
      this.v$.targetAmount.$touch();
    },

    reference() {
      this.v$.reference.$touch();
    },
  },

  data() {
    return {
      reference: this.reserve.reference,
      targetAmount: numberService.amountToString(this.reserve.targetAmount),
      targetDate: this.reserve.targetDate,
      transactions: Array.from([
          this.reserve.revenues.map(r => ({ ...r, cssClass: '' }) ),
          this.reserve.expenses.map(e => ({ ...e, cssClass: 'negative' }) ),
      ]).flat().sort((a, b) => {
        return a.date < b.date ? 1 :
            a.date === b.date ? 0 : -1;
      }),
    };
  },

  methods: {
    save() {
      this.$emit('save', {
        targetAmount: this.targetAmount ? numberService.parseFloat(this.targetAmount) : null,
        targetDate: this.targetDate ? this.targetDate.toISOString() : null,
        reference: this.reference,
      });
    }
  },

  setup() {
    return {
      v$: useVuelidate(),
    };
  },

  validations() {
    return reserveEditValidation;
  },
}
</script>