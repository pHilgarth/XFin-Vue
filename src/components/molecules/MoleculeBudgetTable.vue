<template>
  <div class="molecule-budget-table">
    <table class="molecule-budget-table">
      <thead>
      <tr>
        <th>Kostenstellen-Posten</th>
        <th>Betrag</th>
        <th>Posten bearbeiten</th>
      </tr>
      </thead>
      <tbody>
      <tr>
        <td>(Nicht zugewiesen)</td>
        <td :class="unallocatedAmountClasslist">{{ unallocatedAmount }}</td>
      </tr>
      <tr v-for="costCenterAsset in costCenterAssets" :key="costCenterAsset.id">
        <td>
          <template v-if="selectedCostCenterAssetId === costCenterAsset.id">
            <MoleculeInputText field="cost-center-asset-name" :small="true" :modelValue="updatedCostCenterAssetName" :validation="v$.updatedCostCenterAssetName"
                               :hasErrors="v$.updatedCostCenterAssetName.$error" @blur="v$.updatedCostCenterAssetName.$touch()"
                               @update:modelValue="updatedCostCenterAssetName = $event" />
          </template>
          <template v-else>
            {{ costCenterAsset.name }}
          </template>
        </td>
        <td>
          <template v-if="selectedCostCenterAssetId === costCenterAsset.id">
            <MoleculeInputText field="cost-center-asset-amount" :small="true" :modelValue="updatedCostCenterAssetAmount" :validation="v$.updatedCostCenterAssetAmount"
                               :hasErrors="v$.updatedCostCenterAssetAmount.$error" @blur="v$.updatedCostCenterAssetAmount.$touch()"
                               @update:modelValue="updatedCostCenterAssetAmount = $event" />
          </template>
          <template v-else>
            {{ formatCurrency(costCenterAsset.amount) }}
          </template>
        </td>
        <td class="molecule-budget-table__edit">
          <AtomEditIcon v-if="selectedCostCenterAssetId !== costCenterAsset.id" color="#000000" @click="editCostCenterAsset(costCenterAsset)" />
          <div v-else class="molecule-budget-table__edit__buttons">
            <AtomButton type="primary-small" text="&check;" @click="updateCostCenterAsset(costCenterAsset)" :disabled="costCenterAssetErrors" />
            <AtomButton type="cancel-small" text="&times;" @click="cancelCostCenterAssetEdit" />
          </div>
        </td>
      </tr>
      <tr v-if="createNewCostCenterAsset">
        <td>
          <MoleculeInputText v-if="createNewCostCenterAsset" field="cost-center-asset-name" :small="true" v-model="newCostCenterAssetName"
                             :validation="v$.newCostCenterAssetName" :hasErrors="v$.newCostCenterAssetName.$error" @blur="v$.newCostCenterAssetName.$touch()" />
        </td>
        <td>
        </td>
        <td>
          <div v-if="createNewCostCenterAsset" class="molecule-budget-table__add__buttons">
            <AtomButton type="primary-small" text="&check;" @click="saveCostCenterAsset" :disabled="v$.newCostCenterAssetName.$error || !newCostCenterAssetName" />
            <AtomButton type="cancel-small" text="&times;" @click="cancelCostCenterAssetCreation" />
          </div>
        </td>
      </tr>
      <tr v-for="reserve in reserves" :key="reserve.id">
        <td>{{ reserve.reference }} (Rücklage)</td>
        <td>{{ formatCurrency(reserve.balance) }}</td>
      </tr>
      <tr class="molecule-budget-table__total">
        <td>Summe</td>
        <td>{{ formatCurrency(amount) }}</td>
      </tr>
      </tbody>
    </table>

    <div class="molecule-budget-table__buttons">
      <AtomButton v-if="!createNewCostCenterAsset" type="primary" text="Kostenstellen-Posten hinzufügen" @click="createCostCenterAsset" />
    </div>

  </div>
</template>

<script>
import AtomButton from '@/components/atoms/AtomButton';
import AtomEditIcon from '@/components/atoms/AtomEditIcon';
import MoleculeInputText from '@/components/molecules/MoleculeInputText';

import { numberService } from '@/services/number-service';

import { costCenterAssetValidation } from '@/validation/validations';
import { useVuelidate } from "@vuelidate/core";

export default {
  props: {
    //accountId: { type: Number, required: true },
    amount: { type: Number, required: true },
    costCenterAssets: { type: Array, required: true },
    //costCenterId: { type: Number, required: true },
    //TODO - does "required: true" makes problems here?
    reserves: { type: Array, required: true },
  },

  components: {
    AtomButton,
    AtomEditIcon,
    MoleculeInputText,
  },

  computed: {
    costCenterAssetErrors() {
      return this.v$.updatedCostCenterAssetName.$error || this.v$.updatedCostCenterAssetAmount.$error;
    },

    unallocatedAmountClasslist() {
      let classlist = '';

      classlist += this.selectedCostCenterAssetId ? 'molecule-budget-table__unallocated ' : '';
      classlist += numberService.parseFloat(this.unallocatedAmount) < 0 ? 'molecule-budget-table__unallocated--negative' : '';

      return classlist;
    },
  },

  watch: {
    newCostCenterAssetName() {
      this.v$.newCostCenterAssetName.$touch();
    },

    updatedCostCenterAssetAmount() {
      this.v$.updatedCostCenterAssetAmount.$touch();

      if (!this.v$.updatedCostCenterAssetAmount.$error) {
        this.unallocatedAmount = this.calculateUnallocatedAmount()
      }
    },

    updatedCostCenterAssetName() {
      this.v$.updatedCostCenterAssetName.$touch();
    },
  },

  data() {
    return {
      createNewCostCenterAsset: false,
      newCostCenterAssetName: null,
      selectedCostCenterAssetId: null,
      updatedCostCenterAssetName: null,
      updatedCostCenterAssetAmount: null,
      unallocatedAmount: this.calculateUnallocatedAmount(),
    };
  },

  methods: {
    calculateUnallocatedAmount() {
      let unallocatedAmount = this.amount;

      this.costCenterAssets.forEach(c => {
        if (c.id === this.selectedCostCenterAssetId) {
          unallocatedAmount -= numberService.parseFloat(this.updatedCostCenterAssetAmount);
        }
        else {
          unallocatedAmount -= c.amount;
        }
      });

      //this.costCenterAssets.forEach(c => unallocatedAmount -= c.amount);
      this.reserves.forEach(r => unallocatedAmount -= r.balance)

      return this.formatCurrency(unallocatedAmount);
    },

    cancelCostCenterAssetCreation() {
      this.v$.$reset();
      this.createNewCostCenterAsset = false;
    },

    cancelCostCenterAssetEdit() {
      this.selectedCostCenterAssetId = null;
      this.updatedCostCenterAssetName = null;
      this.updatedCostCenterAssetAmount = null;
      this.costCenterAssetErrors = false;
      this.unallocatedAmount = this.calculateUnallocatedAmount();
    },

    createCostCenterAsset() {
      this.createNewCostCenterAsset = true
      this.cancelCostCenterAssetEdit();
    },

    editCostCenterAsset(costCenterAsset) {
      this.cancelCostCenterAssetCreation()
      this.selectedCostCenterAssetId = costCenterAsset.id;
      this.updatedCostCenterAssetName = costCenterAsset.name;
      this.updatedCostCenterAssetAmount = numberService.amountToString(costCenterAsset.amount);
    },

    formatCurrency(value, includeCurrency) {
      return numberService.formatCurrency(value, includeCurrency);
    },

    parseFloat(value) {
      return numberService.parseFloat(value);
    },

    saveCostCenterAsset() {
      this.$emit('saveCostCenterAsset', this.newCostCenterAssetName);
      this.createNewCostCenterAsset = false;
      this.newCostCenterAssetName = null;
      //TODO - resetting does not work - if I create two assets, the field has a red border on the second
      this.v$.$reset();
    },

    updateCostCenterAsset(costCenterAsset) {
      if (this.updatedCostCenterAssetName !== costCenterAsset.name || this.updatedCostCenterAssetAmount !== costCenterAsset.amount) {
        this.$emit('updateCostCenterAsset', { id: costCenterAsset.id, amount: numberService.parseFloat(this.updatedCostCenterAssetAmount), name: this.updatedCostCenterAssetName });
        this.selectedCostCenterAssetId = null;
        this.updatedCostCenterAssetAmount = null;
        this.updatedCostCenterAssetName = null;
      }
    }
  },

  setup() {
    return { v$: useVuelidate() };
  },

  validations() {
    return costCenterAssetValidation;
  },
};

</script>