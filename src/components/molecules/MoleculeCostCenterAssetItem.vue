<template>
  <div class="col-8">
    <template v-if="selectedCostCenterAssetId === costCenterAsset.id">
      <MoleculeInputText field="cost-center-asset-name" :small="true" :modelValue="updatedCostCenterAssetName"
                         :validation="v$.updatedCostCenterAssetName"
                         :hasErrors="v$.updatedCostCenterAssetName.$error"
                         @blur="v$.updatedCostCenterAssetName.$touch()"
                         @update:modelValue="updatedCostCenterAssetName = $event"/>
    </template>
    <span v-else class="col-2">{{ costCenterAsset.name }}</span>
  </div>
  <div class="text-right col-2">
    <template v-if="selectedCostCenterAssetId === costCenterAsset.id">
      <MoleculeInputText field="cost-center-asset-amount" :small="true" :modelValue="updatedCostCenterAssetAmount"
                         :validation="v$.updatedCostCenterAssetAmount"
                         :hasErrors="v$.updatedCostCenterAssetAmount.$error"
                         @blur="v$.updatedCostCenterAssetAmount.$touch()"
                         @update:modelValue="updatedCostCenterAssetAmount = $event"/>
    </template>
    <span v-else class="col-2">{{ formatCurrency(costCenterAsset.amount) }}</span>
  </div>
  <div class="position-relative text-center col-2">
    <AtomEditIcon v-if="selectedCostCenterAssetId !== costCenterAsset.id" class="col-2" align="center" color="#000000"
                  @click="editCostCenterAsset"/>
    <template v-else>
      <AtomButton type="primary-small" text="&check;" @click="updateCostCenterAmount"
                  :disabled="v$.updatedCostCenterAssetAmount.$error"/>
      <AtomButton type="cancel-small" text="&times;" @click="cancelCostCenterAssetEdit"/>
    </template>
  </div>
</template>

<script>
import AtomButton from '@/components/atoms/AtomButton';
import AtomEditIcon from '@/components/atoms/AtomEditIcon';
import MoleculeInputText from '@/components/molecules/MoleculeInputText';

import {costCenterAssetService} from '@/services/cost-center-asset-service';
import {numberService} from '@/services/number-service';

import {balanceValidator} from '@/validation/custom-validators';

import {useVuelidate} from "@vuelidate/core";

import {required} from '@vuelidate/validators';

export default {
  components: {
    AtomButton,
    AtomEditIcon,
    MoleculeInputText,
  },

  data() {
    return {
      updatedCostCenterAssetName: null,
      updatedCostCenterAssetAmount: null,
    }
  },

  emits: [
    'calculateFreeBudget',
    'cancelEdit',
    'edit',
    'update'
  ],

  methods: {
    cancelCostCenterAssetEdit() {
      this.updatedCostCenterAssetName = null;
      this.updatedCostCenterAssetAmount = null;
      this.$emit('cancelEdit');
      //this.costCenterAssetErrors = false;
      //this.unallocatedAmount = this.calculateUnallocatedAmount();
    },

    editCostCenterAsset() {
      //this.cancelCostCenterAssetCreation()
      //this.selectedCostCenterAssetId = this.costCenterAsset.id;
      this.updatedCostCenterAssetName = this.costCenterAsset.name;
      this.updatedCostCenterAssetAmount = numberService.amountToString(this.costCenterAsset.amount);
      this.$emit('edit', this.costCenterAsset.id);
    },

    formatCurrency(value) {
      return numberService.formatCurrency(value);
    },

    async updateCostCenterAmount() {
      console.log(this.updatedCostCenterAssetAmount);
      try {
        await costCenterAssetService.update(
            this.costCenterAsset.id,
            [
              {
                op: "replace",
                path: "/amount",
                value: numberService.parseFloat(this.updatedCostCenterAssetAmount),
              },
              {
                op: "replace",
                path: "/name",
                value: this.updatedCostCenterAssetName,
              },
            ],
        );

        this.updatedCostCenterAssetName = null;
        this.updatedCostCenterAssetAmount = null;
        this.$emit('update');
      } catch (error) {
        console.error(error);
      }
    },
  },

  props: {
    costCenterAsset: {type: Object, required: true},
    selectedCostCenterAssetId: {type: Number},
  },

  setup() {
    return {v$: useVuelidate()}
  },

  validations() {
    return {
      updatedCostCenterAssetAmount: {balanceValidator},
      updatedCostCenterAssetName: {required},
    };
  },

  watch: {
    selectedCostCenterAssetId() {
      if (this.selectedCostCenterAssetId !== this.costCenterAsset.id) {
        this.updatedCostCenterAssetAmount = null;
        this.updatedCostCenterAssetName = null;
        this.$emit('calculateFreeBudget');
      }
    },

    updatedCostCenterAssetAmount() {
      this.v$.updatedCostCenterAssetAmount.$touch();

      if (!this.v$.updatedCostCenterAssetAmount.$error) {
        this.$emit('calculateFreeBudget', this.updatedCostCenterAssetAmount);
      }
    },
  }
};
</script>