<template>
  <div class="molecule-cost-center-list-item">
    <div class="organism-cost-center-list__header">
      <div :class="`organism-cost-center-list__state${ collapsed ? ' collapsed' : ''}`"
           @click="collapsed = !collapsed">
        <div class="organism-cost-center-list__bar"></div>
        <div class="organism-cost-center-list__bar"></div>
      </div>
      <span class="organism-cost-center-list__name col-6">{{ costCenter.name }}</span>
      <div class="text-right col-4">
        <template v-if="selectedCostCenterId === costCenter.id">
          <MoleculeInputText field="cost-center-amount" :small="true" :modelValue="updatedCostCenterAmount" :validation="v$.updatedCostCenterAmount"
                             :hasErrors="v$.updatedCostCenterAmount.$error" @blur="v$.updatedCostCenterAmount.$touch()"
                             @update:modelValue="updatedCostCenterAmount = $event" />
        </template>
        <span v-else class="col-2">{{ formatCurrency(costCenter.balance) }}</span>
      </div>
      <div class="position-relative text-center col-2">
        <AtomEditIcon v-if="selectedCostCenterId !== costCenter.id" class="col-2" align="center" color="#000000" @click="editCostCenterAmount(costCenter)"/>
        <template v-else>
          <AtomButton type="primary-small" text="&check;" @click="updateCostCenterAmount" :disabled="v$.updatedCostCenterAmount.$error" />
          <AtomButton type="cancel-small" text="&times;" @click="cancelCostCenterAmountEdit" />
        </template>
      </div>
    </div>
    <div :class="`organism-cost-center-list__body${ collapsed ? ' collapsed' : ''}`" style="background-color:#efefef">
      <div>
        Freies Budget
      </div>
      <div v-for="costCenterAsset in costCenter.costCenterAssets" :key="costCenterAsset.id">
        {{ costCenterAsset.name }}
      </div>
    </div>
    {{ updatedCostCenterAmount }}
  </div>
</template>

<script>
import AtomButton from '@/components/atoms/AtomButton';
import AtomEditIcon from '@/components/atoms/AtomEditIcon';
import MoleculeInputText from "../molecules/MoleculeInputText";

import { numberService } from '@/services/number-service';

import { balanceValidator } from '@/validation/custom-validators';

import { useVuelidate } from "@vuelidate/core";

export default {
  components: {
    AtomButton,
    AtomEditIcon,
    MoleculeInputText,
  },

  data() {
    return {
      collapsed: true,
      updatedCostCenterAmount: null,
    };
  },

  methods: {
    cancelCostCenterAmountEdit() {
      this.v$.$reset();
      this.updatedCostCenterAmount = null;
      this.$emit('cancelEdit');
    },

    editCostCenterAmount(costCenter) {
      this.updatedCostCenterAmount = numberService.amountToString(costCenter.balance);
      this.$emit('edit', costCenter.id);
    },

    formatCurrency(value) {
      return numberService.formatCurrency(value);
    },

    updateCostCenterAmount() {
      this.$emit('save', this.updatedCostCenterAmount);

      this.v$.$reset();
      this.updatedCostCenterAmount = null;
    }
  },

  props: {
    costCenter: { type: Object, required: true },
    selectedCostCenterId: { type: Number },
  },

  setup() {
    return { v$: useVuelidate() }
  },

  validations() {
    return {
      updatedCostCenterAmount: { balanceValidator },
    };
  },

  watch: {
    updatedCostCenterAmount() {
      this.v$.updatedCostCenterAmount.$touch();

      if (!this.v$.updatedCostCenterAmount.$error) {
        this.$emit('calculateFreeBudget', this.updatedCostCenterAmount);
      }
    },
  },
};
</script>