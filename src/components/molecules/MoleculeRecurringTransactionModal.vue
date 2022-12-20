<template>
  <div class="molecule-recurring-transaction-modal">
    <div class="molecule-recurring-transaction-modal__inner">
      <AtomHeadline tag="h1" text="Transaktionsdetails" />
      <table class="molecule-recurring-transaction-modal__details">
        <tbody>
        <tr>
          <th>Zahlungspflichtiger</th>
          <td>{{ `${this.recurringTransaction.sourceBankAccount.accountHolderName} (${this.recurringTransaction.sourceCostCenter.name})` }}</td>
          <td></td>
        </tr>
        <tr>
          <th>Zahlungsempfänger</th>
          <td>{{ `${this.recurringTransaction.targetBankAccount.accountHolderName} (${this.recurringTransaction.targetCostCenter.name})` }}</td>
          <td></td>
        </tr>
        <tr>
          <th>Verwendungszweck</th>
          <td>
            <MoleculeInputText field="reference" v-model="reference" label="Verwendungszweck" :small="true" :hasErrors="v$.reference.$error"
                               @blur="v$.reference.$touch()" />
          </td>
          <td v-if="v$.reference.$errors.length" class="molecule-recurring-transaction-modal__error">
            <template v-for="(error, index) in v$.reference.$errors" :key="index">
              <MoleculeFormError :error="error" />
            </template>
          </td>
          <td v-else></td>
        </tr>
        <tr>
          <!-- TODO - test this v-if else -->
          <th>Ausführung ab</th>
          <td v-if="allowEditStartDate">
            <Datepicker class="vuepic-datepicker vuepic-datepicker--small" :class="v$.startDate.$error ? 'has-errors' : ''" v-model="startDate"
                        placeholder="Ausführung ab" locale="de" format="dd.MM.yyyy" :minDate="new Date()" :maxDate="maxStartDate"
                        :enableTimePicker="false" autoApply />
          </td>
          <td v-else>{{ formatDate(this.startDate) }}</td>
          <td v-if="v$.startDate.$errors.length" class="molecule-recurring-transaction-modal__error">
            <template v-for="(error, index) in v$.startDate.$errors" :key="index">
              <MoleculeFormError :error="error" />
            </template>
          </td>
          <td v-else></td>
        </tr>
        <tr>
          <th>Ausführung bis</th>
          <td v-if="!editOnce">
            <Datepicker class="vuepic-datepicker vuepic-datepicker--small" :class="v$.endDate.$error ? 'has-errors' : ''" v-model="endDate"
                        placeholder="Ausführung bis" locale="de" format="dd.MM.yyyy" :minDate="minEndDate" :enableTimePicker="false" autoApply />
          </td>
          <td v-else>{{ formatDate(this.endDate) }}</td>
          <td v-if="v$.endDate.$errors.length" class="molecule-recurring-transaction-modal__error">
            <template v-for="(error, index) in v$.endDate.$errors" :key="index">
              <MoleculeFormError :error="error" />
            </template>
          </td>
          <td v-else></td>
        </tr>
        <tr>
          <th>Fällig am</th>
          <td v-if="!editOnce">
            <MoleculeInputText field="day-of-month" v-model="dayOfMonth" label="Fällig am" :small="true" :hasErrors="v$.dayOfMonth.$error"
                               @blur="v$.dayOfMonth.$touch()" />
          </td>
          <td v-else>
            {{ dayOfMonth }}.
          </td>
          <td v-if="v$.dayOfMonth.$errors.length" class="molecule-recurring-transaction-modal__error">
            <template v-for="(error, index) in v$.dayOfMonth.$errors" :key="index">
              <MoleculeFormError :error="error" />
            </template>
          </td>
          <td v-else></td>
        </tr>
        <tr>
          <th>Turnus</th>
          <td v-if="!editOnce">
            <MoleculeInputAutoSuggest field="cycle" small v-model="cycleItem" :items="cycleItems" :hasErrors="v$.cycleItem?.$error"
                                      @itemPicked="pickCycleItem" @blur="onBlurCycleItem" />
          </td>
          <td v-else>
            {{ cycle }}
          </td>
          <td v-if="v$.cycleItem.$errors.length" class="molecule-recurring-transaction-modal__error">
            <template v-for="(error, index) in v$.cycleItem.$errors" :key="index">
              <MoleculeFormError :error="error" />
            </template>
          </td>
          <td v-else></td>
        </tr>
        <tr>
          <th>Betrag</th>
          <td>
            <MoleculeInputText class="molecule-recurring-transaction-details__amount" field="amount" v-model="amount" label="Betrag" :small="true"
                               :hasErrors="v$.amount.$error" @blur="v$.amount.$touch()" />
          </td>
          <td v-if="v$.amount.$errors.length" class="molecule-recurring-transaction-modal__error">
            <template v-for="(error, index) in v$.amount.$errors" :key="index">
              <MoleculeFormError :error="error" />
            </template>
          </td>
          <td v-else>
          </td>
        </tr>
        </tbody>
      </table>
<!--      <OrganismCollapsibleWithSlot v-if="recurringTransaction.transactions.length" title="Transaktionen">-->
<!--        <MoleculeRecurringTransactionTransactions :transactions="recurringTransaction.transactions" />-->
<!--      </OrganismCollapsibleWithSlot>-->

      <AtomButton type="primary" :disabled="v$.$silentErrors.length" :text="saveText" @click="save" />
      <AtomButton type="cancel" text="Abbrechen" @click="$emit('cancel')" />

      <pre>{{ cycleItem }}</pre>
    </div>
  </div>
</template>

<script>

import AtomButton from '@/components/atoms/AtomButton';
import AtomHeadline from '@/components/atoms/AtomHeadline';
import MoleculeFormError from '@/components/molecules/MoleculeFormError';
import MoleculeInputAutoSuggest from '@/components/molecules/MoleculeInputAutoSuggest';
import MoleculeInputText from '@/components/molecules/MoleculeInputText';
//import MoleculeRecurringTransactionDetails from '@/components/molecules/MoleculeRecurringTransactionDetails';
//import MoleculeRecurringTransactionTransactions from '@/components/molecules/MoleculeRecurringTransactionTransactions';
//import OrganismCollapsibleWithSlot from '@/components/organisms/OrganismCollapsibleWithSlot';

import { numberService } from '@/services/number-service';

import { recurringTransactionValidation } from '@/validation/validations';

import Datepicker from '@vuepic/vue-datepicker';

import { useVuelidate } from "@vuelidate/core";

export default {
  components: {
    AtomButton,
    AtomHeadline,
    MoleculeFormError,
    MoleculeInputAutoSuggest,
    MoleculeInputText,
    //MoleculeRecurringTransactionDetails,
    //MoleculeRecurringTransactionTransactions,
    //OrganismCollapsibleWithSlot,
    Datepicker,
  },

  props: {
    editOnce:             { type: Boolean, default: false },
    recurringTransaction: { type: Object, required: true },
    saveText:             { type: String, default: 'Speichern' },
  },

  mounted() {
    this.cycleItem = this.cycleItems.find(c => c.id === this.recurringTransaction.cycle);
  },

  computed: {
    allowEditStartDate() {
      return !this.editOnce && Date.parse(this.recurringTransaction.startDate) > new Date();
    },

    minEndDate() {
      let minEndDate = this.startDate ? new Date(this.startDate) : new Date();

      minEndDate.setMonth(minEndDate.getMonth() + this.recurringTransaction.cycle);

      //if startDate has already passed, minEndDate might as well, so I set it to today plus one cycle
      if (minEndDate < new Date()) {
        minEndDate = new Date();
        minEndDate.setMonth(minEndDate.getMonth() + this.recurringTransaction.cycle);
      }

      return minEndDate;
    },

    maxStartDate() {
      const maxStartDate = this.endDate ? new Date(this.endDate) : null;

      if (maxStartDate) {
        maxStartDate.setMonth(maxStartDate.getMonth() - this.recurringTransaction.cycle);
      }

      return maxStartDate;
    }
  },

  watch: {
    amount() {
      this.v$.amount.$touch();
    },

    cycle() {
      this.v$.cycle.$touch();
    },

    dayOfMonth() {
      this.dayOfMonth = this.dayOfMonth.replaceAll('.', '');
      this.v$.dayOfMonth.$touch();
    },

    reference() {
      this.v$.reference.$touch();
    },

    startDate() {
      this.v$.startDate.$touch();
      //watcher gets called twice ... don't know why, but second time "toISOString()" throws an error
      if (this.startDate !== null && typeof this.startDate === 'object') {
        this.startDate = this.startDate.toISOString();
      }
    },

    endDate() {
      this.v$.endDate.$touch();
      //watcher gets called twice ... don't know why, but second time "toISOString()" throws an error
      if (this.endDate !== null && typeof this.endDate === 'object') {
        this.endDate = this.endDate.toISOString();
      }
    }
  },

  data() {
    return {
      amount: numberService.amountToString(this.recurringTransaction.amount),
      cycleItem: null,
      cycleItems: [
        { id: 1, label: 'monatlich' },
        { id: 3, label: 'vierteljährlich' },
        { id: 6, label: 'halbjährlich' },
        { id: 12, label: 'jährlich' },
      ],
      dataLoaded: false,
      dayOfMonth: this.recurringTransaction.dayOfMonth.toString(),
      endDate: this.recurringTransaction.endDate,//this.formatDate(this.recurringTransaction.endDate),
      loadingError: false,
      reference: this.recurringTransaction.reference,
      startDate: this.recurringTransaction.startDate,
    };
  },

  methods: {
    formatDate(value) {
      return numberService.formatDate(value);
    },

    onBlurCycleItem(event) {
      if (this.cycleItem?.label !== event.target.value) {
        this.cycleItem = null;
      }
    },

    pickCycleItem(id) {
      this.cycleItem = this.cycleItems.find(c => c.id == id);
    },

    save() {
      this.$emit('save', {
        amount: numberService.parseFloat(this.amount),
        cycle: this.cycleItem.id,
        dayOfMonth: parseInt(this.dayOfMonth),
        endDate: this.endDate,
        reference: this.reference,
        startDate: this.startDate
      });
    }
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