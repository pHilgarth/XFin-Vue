<template>
  <div class="molecule-cost-center-list-item accordion-item">
    <div class="molecule-cost-center-list-item__header">
      <div class="molecule-cost-center-list-item__button collapsed col-8"
           type="button" data-bs-toggle="collapse"
           :data-bs-target="`#collapse-${costCenter.id}`">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-up" viewBox="0 0 16 16">
          <path fill-rule="evenodd" d="M7.646 4.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 5.707l-5.646 5.647a.5.5 0 0 1-.708-.708l6-6z"/>
        </svg>
        <span>{{ costCenter.name }}</span>
      </div>
      <div class="text-right col-2">
        <template v-if="selectedCostCenterId === costCenter.id">
          <MoleculeInputText field="cost-center-amount" :small="true" :modelValue="updatedCostCenterAmount" :validation="v$.updatedCostCenterAmount"
                             :hasErrors="v$.updatedCostCenterAmount.$error" @blur="v$.updatedCostCenterAmount.$touch()"
                             @update:modelValue="updatedCostCenterAmount = $event" />
        </template>
        <span v-else class="col-4">{{ formatCurrency(costCenter.balance) }}</span>
      </div>
      <div class="position-relative text-center col-2">
        <AtomEditIcon v-if="selectedCostCenterId !== costCenter.id" class="col-2" align="center" color="#000000" @click="editCostCenterAmount(costCenter)"/>
        <template v-else>
          <AtomButton type="primary-small" text="&check;" @click="updateCostCenterAmount" :disabled="v$.updatedCostCenterAmount.$error" />
          <AtomButton type="cancel-small" text="&times;" @click="cancelCostCenterAmountEdit" />
        </template>
      </div>
    </div>
    <div :id="`collapse-${costCenter.id}`" class="molecule-cost-center-list-item__body accordion-collapse collapse">
      <div class="molecule-cost-center-list-item__cost-center-asset">
        <div class="col-8">
          Freies Budget
        </div>
        <div class="text-right col-2">
          <span>{{ formatCurrency(freeBudget) }}</span>
        </div>
      </div>
      <div class="molecule-cost-center-list-item__cost-center-asset" v-for="costCenterAsset in costCenter.costCenterAssets" :key="costCenterAsset.id">
        <MoleculeCostCenterAssetItem
            :account="account"
            :costCenter="costCenter"
            :costCenterAsset="costCenterAsset"
            :selectedCostCenterAssetId="selectedCostCenterAssetId"
            @calculateFreeBudget="freeBudget = calculateFreeBudget($event)"
            @cancelEdit="cancelCostCenterAssetEdit"
            @edit="editCostCenterAsset"
            @update="$emit('updateCostCenterAsset')" />
      </div>
      <div class="molecule-cost-center-list-item__cost-center-asset">
        <div class="col-8">
          <AtomButton v-if="costCenterIdForAssetCreation !== costCenter.id" type="primary-small" text="Neuen Posten anlegen" @click="addCostCenterAsset" />
          <template v-else>
            <MoleculeInputText class="w-75" field="cost-center-asset-name" label="Name" :small="true" v-model="newCostCenterAssetName"
                               :validation="v$.newCostCenterAssetName" :hasErrors="v$.newCostCenterAssetName.$error" @blur="v$.newCostCenterAssetName.$touch()" />
          </template>
        </div>
        <div v-if="costCenterIdForAssetCreation === costCenter.id" class="col-2 text-right">
          <MoleculeInputText field="cost-center-asset-amount" label="Betrag" :small="true" v-model="newCostCenterAssetAmount"
                             :validation="v$.newCostCenterAssetAmount" :hasErrors="v$.newCostCenterAssetAmount.$error"
                             @blur="v$.newCostCenterAssetAmount.$touch()" />
        </div>
        <div v-if="costCenterIdForAssetCreation === costCenter.id" class="col-2 text-center">
          <AtomButton type="primary-small" text="&check;" @click="saveNewCostCenterAsset" :disabled="newCostCenterAssetSaveDisabled" />
          <AtomButton type="cancel-small" text="&times;" @click="cancelNewCostCenterAsset" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AtomButton from '@/components/atoms/AtomButton';
import AtomEditIcon from '@/components/atoms/AtomEditIcon';
import MoleculeCostCenterAssetItem from '@/components/molecules/MoleculeCostCenterAssetItem';
import MoleculeInputText from "../molecules/MoleculeInputText";

//import { costCenterAssetService } from '@/services/cost-center-asset-service';
import { numberService } from '@/services/number-service';

import { balanceValidator } from '@/validation/custom-validators';

import { useVuelidate } from "@vuelidate/core";

import { required } from "@vuelidate/validators";

export default {
  components: {
    AtomButton,
    AtomEditIcon,
    MoleculeCostCenterAssetItem,
    MoleculeInputText,
  },

  computed: {
    newCostCenterAssetSaveDisabled() {
      return this.v$.newCostCenterAssetName.$silentErrors.length ||this.v$.newCostCenterAssetAmount.$silentErrors.length;
    },
  },

  data() {
    return {
      collapsed: true,
      freeBudget: this.calculateFreeBudget(),
      newCostCenterAssetAmount: null,
      newCostCenterAssetName: null,
      updatedCostCenterAmount: null,
    };
  },

  methods: {
    addCostCenterAsset() {
      this.cancelCostCenterAmountEdit();
      this.cancelCostCenterAssetEdit();
      this.$emit('addCostCenterAsset', this.costCenter.id);
    },

    calculateFreeBudget(updatedCostCenterAssetAmount) {
      if (updatedCostCenterAssetAmount) {
        let newFreeBudget = this.costCenter.balance;
        this.costCenter.costCenterAssets.forEach(c => {
          if (c.id === this.selectedCostCenterAssetId) {
            newFreeBudget -= numberService.parseFloat(updatedCostCenterAssetAmount);
          }
          else {
            newFreeBudget -= c.balance;
          }
        });

        return newFreeBudget;
      }
      else if (this.newCostCenterAssetAmount) {
        return (
          this.costCenter.balance -
          this.costCenter.costCenterAssets.reduce((a, b) => a + b.balance, 0) -
          numberService.parseFloat(this.newCostCenterAssetAmount)
        );
      }

      return this.updatedCostCenterAmount
          ? numberService.parseFloat(this.updatedCostCenterAmount) - this.costCenter.costCenterAssets.reduce((a, b) => a + b.balance, 0)
          : this.costCenter.balance - this.costCenter.costCenterAssets.reduce((a, b) => a + b.balance, 0);
    },

    cancelCostCenterAmountEdit() {
      this.v$.$reset();
      this.updatedCostCenterAmount = null;
      this.freeBudget = this.calculateFreeBudget();
      this.$emit('cancelEdit');
    },

    cancelCostCenterAssetEdit() {
      this.$emit('cancelCostCenterAssetEdit');
      this.freeBudget = this.calculateFreeBudget();
    },

    cancelNewCostCenterAsset() {
      this.newCostCenterAssetName = null;
      this.newCostCenterAssetAmount = null;
      this.freeBudget = this.calculateFreeBudget();
      this.$emit('cancelNewCostCenterAsset');
    },

    editCostCenterAmount() {
      this.cancelNewCostCenterAsset();
      this.updatedCostCenterAmount = numberService.amountToString(this.costCenter.balance);
      this.$emit('editCostCenter', this.costCenter.id);
    },

    editCostCenterAsset(costCenterAssetId) {
      this.cancelNewCostCenterAsset();
      this.$emit('editCostCenterAsset', costCenterAssetId);
    },

    formatCurrency(value) {
      return numberService.formatCurrency(value);
    },

    saveNewCostCenterAsset() {
      //TODO - create an initialization transaction for the new costCenterAsset
      this.$emit('saveNewCostCenterAsset', {
        costCenterId: this.costCenter.id,
        name: this.newCostCenterAssetName,
        amount: this.newCostCenterAssetAmount,
      });
    },

    updateCostCenterAmount() {
      this.$emit('save', this.updatedCostCenterAmount);

      this.v$.$reset();
      this.updatedCostCenterAmount = null;
    }
  },

  props: {
    account: { type: Object, required: true },
    costCenter: { type: Object, required: true },
    costCenterIdForAssetCreation: { type: Number },
    selectedCostCenterAssetId: { type: Number },
    selectedCostCenterId: { type: Number },
  },

  setup() {
    return { v$: useVuelidate() }
  },

  validations() {
    return {
      newCostCenterAssetAmount: { balanceValidator },
      newCostCenterAssetName: { required },
      updatedCostCenterAmount: { balanceValidator },
    };
  },

  watch: {
    costCenter() {
      this.freeBudget = this.calculateFreeBudget();
    },

    costCenterIdForAssetCreation() {
      if (this.costCenterIdForAssetCreation !== this.costCenter.id) {
        this.newCostCenterAssetAmount = null;
        this.newCostCenterAssetName = null;
        this.freeBudget = this.calculateFreeBudget();
      }
    },

    newCostCenterAssetAmount() {
      this.v$.newCostCenterAssetAmount.$touch();

      if (!this.v$.newCostCenterAssetAmount.$error) {
        this.freeBudget = this.calculateFreeBudget();
      }
    },

    newCostCenterAssetName() {
      this.v$.newCostCenterAssetName.$touch();
    },

    selectedCostCenterId() {
      if (this.selectedCostCenterId !== this.costCenter.id) {
        this.updatedCostCenterAmount = null;
        this.freeBudget = this.calculateFreeBudget();
      }
    },

    updatedCostCenterAmount() {
      this.v$.updatedCostCenterAmount.$touch();

      if (!this.v$.updatedCostCenterAmount.$error) {
        this.freeBudget = this.calculateFreeBudget();
        this.$emit('calculateFreeBudget', this.updatedCostCenterAmount);
      }
    },
  },
};
</script>