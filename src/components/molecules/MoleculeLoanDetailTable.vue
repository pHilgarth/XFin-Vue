<template>
  <table class="molecule-loan-detail-table">
    <tbody>
    <tr>
      <th>Gläubiger</th>
      <td>{{  loan.creditorBankAccount.accountHolderName }}</td>
      <td></td>
    </tr>
    <tr>
      <th>Schuldner</th>
      <td>{{ loan.debitorBankAccount.accountHolderName }}</td>
      <td></td>
    </tr>
    <tr>
      <th>Darlehensbetrag</th>
      <td>{{ formatCurrency(loan.amount) }}</td>
      <td></td>
    </tr>
    <tr>
      <th>Zinssatz</th>
      <td>{{ loan.rateOfInterest }}%</td>
      <td></td>
    </tr>
    <tr>
      <th>Monatliche Rate</th>
      <td class="molecule-loan-detail-table__monthly-installment">
        <template v-if="editMonthlyInstallment">
          <MoleculeInputText field="monthly-installment" small v-model="monthlyInstallment"
                             :hasErrors="v$.monthlyInstallment.$error" @blur="v$.monthlyInstallment.$touch()" />
          <div class="molecule-loan-detail-table__buttons">
            <AtomButton type="primary-small" text="&check;" @click="updateLoan" :disabled="v$.monthlyInstallment.$error" />
            <AtomButton type="cancel-small" text="&times;" @click="editMonthlyInstallment = false" />
          </div>
        </template>
        <template v-else>
          {{ formatCurrency(this.loan.monthlyInstallment) }}
        </template>
      </td>
      <td class="molecule-loan-detail-table__edit">
        <template v-if="editMonthlyInstallment && v$.monthlyInstallment.$errors?.length">
          <!-- TODO - only one error should be present at a time,I shouldn't need to iterate over errors -->
          <template v-for="(error, index) in v$.monthlyInstallment.$errors" :key="index">
            <MoleculeFormError :error="error" />
          </template>
        </template>
        <template v-else-if="!editMonthlyInstallment">
          <AtomEditIcon color="#000000" @click="editMonthlyInstallment = true" />
        </template>
      </td>
    </tr>
    <tr>
      <th>Restbetrag</th>
      <td>{{ formatCurrency(loan.balance) }}</td>
    </tr>
    </tbody>
  </table>
</template>

<script>
import AtomButton from '@/components/atoms/AtomButton';
import AtomEditIcon from '@/components/atoms/AtomEditIcon';
import MoleculeFormError from '@/components/molecules/MoleculeFormError';
import MoleculeInputText from '@/components/molecules/MoleculeInputText';

import { loanService } from '@/services/loan-service';
import { numberService } from '@/services/number-service';

import { zeroAmountValidator } from '@/validation/custom-validators';

import { useVuelidate } from "@vuelidate/core";

export default {
  props: {
    loan: { type: Object, required: true },
  },

  components: {
    AtomButton,
    AtomEditIcon,
    MoleculeFormError,
    MoleculeInputText,
  },

  watch: {
    monthlyInstallment() {
      this.v$.monthlyInstallment.$touch();
    }
  },

  data() {
    return {
      editMonthlyInstallment: false,
      monthlyInstallment: numberService.amountToString(this.loan.monthlyInstallment),
    };
  },

  methods: {
    formatCurrency(value) {
      return numberService.formatCurrency(value);
    },

    async updateLoan() {
      try {
        const jsonPatchDocument = [{
          op: 'replace',
          path: '/monthlyInstallment',
          value: numberService.parseFloat(this.monthlyInstallment),
        }];

        await loanService.update(this.loan.id, jsonPatchDocument);
        this.editMonthlyInstallment = false;

        this.$emit('update-loan');
      }
      catch(error) {
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
    return {
      monthlyInstallment: { zeroAmountValidator} };
  },
};
</script>