<template>
  <div class="organism-cost-center-list accordion">
    <MoleculeCostCenterListItem
        v-for="costCenter in costCenters"
        :key="costCenter.id"
        :costCenter="costCenter"
        :costCenterIdForAssetCreation="costCenterIdForAssetCreation"
        :selectedCostCenterAssetId="selectedCostCenterAssetId"
        :selectedCostCenterId="selectedCostCenterId"
        @addCostCenterAsset="addCostCenterAsset"
        @calculateFreeBudget="calculateFreeBudget"
        @cancelEdit="cancelEdit"
        @cancelCostCenterAssetEdit="selectedCostCenterAssetId = null"
        @cancelNewCostCenterAsset="costCenterIdForAssetCreation = null"
        @editCostCenter="editCostCenter"
        @editCostCenterAsset="editCostCenterAsset"
        @save="save"
        @saveNewCostCenterAsset="saveNewCostCenterAsset"
        @updateCostCenterAsset="updateCostCenterAsset"
    />
    <div class="organism-cost-center-list__new-cost-center">
      <AtomButton v-if="!createNewCostCenter" type="primary-small" text="Neue Kostenstelle anlegen"
                  @click="createNewCostCenter = true"/>
      <template v-else>
        <div class="col-8">
          <MoleculeInputText class="w-75" field="cost-center-name" label="Name" :small="true" v-model="newCostCenterName"
                             :validation="v$.newCostCenterName" :hasErrors="v$.newCostCenterName.$error"
                             @blur="v$.newCostCenterName.$touch()"/>
        </div>
        <div class="col-2">
          <MoleculeInputText field="cost-center-amount" label="Betrag" :small="true" v-model="newCostCenterAmount"
                             :validation="v$.newCostCenterAmount" :hasErrors="v$.newCostCenterAmount.$error"
                             @blur="v$.newCostCenterAmount.$touch()" />
        </div>
        <div class="col-2 text-center">
          <AtomButton type="primary-small" text="&check;" @click="saveNewCostCenter" :disabled="newCostCenterSaveDisabled" />
          <AtomButton type="cancel-small" text="&times;" @click="cancelNewCostCenter" />
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import AtomButton from '@/components/atoms/AtomButton';
import MoleculeCostCenterListItem from '@/components/molecules/MoleculeCostCenterListItem';
import MoleculeInputText from '@/components/molecules/MoleculeInputText';

import {costCenterService} from "@/services/cost-center-service";
import {costCenterAssetService} from "@/services/cost-center-asset-service";
import {numberService} from "@/services/number-service";
import {transactionService} from "@/services/transaction-service";

import {balanceValidator} from "@/validation/custom-validators";

import {useVuelidate} from "@vuelidate/core";

import {required} from "@vuelidate/validators";

export default {
  components: {
    AtomButton,
    MoleculeCostCenterListItem,
    MoleculeInputText,
  },

  computed: {
    newCostCenterSaveDisabled() {
      return this.v$.newCostCenterName.$silentErrors.length || this.v$.newCostCenterAmount.$silentErrors.length;
    },
  },

  created() {
    if (this.$cookies.get('user')) {
      this.user = this.$cookies.get('user');
    }
  },

  data() {
    return {
      costCenterIdForAssetCreation: null,
      createNewCostCenter: false,
      newCostCenterAmount: null,
      newCostCenterName: null,
      selectedCostCenterAssetId: null,
      selectedCostCenterId: null,
      user: null,
    };
  },

  methods: {
    addCostCenterAsset(costCenterId) {
      this.cancelNewCostCenter();
      this.costCenterIdForAssetCreation = costCenterId;
    },

    calculateFreeBudget(event) {
      let newFreeBudget = this.account.totalBalance;

      this.costCenters.forEach(c => {
        if (c.id === this.selectedCostCenterId) {
          newFreeBudget -= numberService.parseFloat(event);
        } else {
          newFreeBudget -= c.balance;
        }
      });

      newFreeBudget -= this.newCostCenterAmount
        ? numberService.parseFloat(this.newCostCenterAmount)
        : 0;

      this.$emit('updateFreeBudget', newFreeBudget);
    },

    cancelEdit() {
      this.selectedCostCenterId = null;
      this.calculateFreeBudget();
    },

    cancelNewCostCenter() {
      this.newCostCenterName = null;
      this.newCostCenterAmount = null;
      this.createNewCostCenter = false;
      this.calculateFreeBudget();
    },

    editCostCenterAsset(costCenterAssetId) {
      this.selectedCostCenterId = null;
      this.selectedCostCenterAssetId = costCenterAssetId;
      this.cancelNewCostCenter();
    },

    editCostCenter(costCenterId) {
      this.cancelNewCostCenter();
      this.selectedCostCenterId = costCenterId;
      this.selectedCostCenterAssetId = null;
    },

    formatCurrency(value) {
      return numberService.formatCurrency(value);
    },

    async save(updatedBalance) {
      try {
        updatedBalance = numberService.parseFloat(updatedBalance);
        const costCenterToUpdate = this.costCenters.find(c => c.id === this.selectedCostCenterId);
        let sourceCostCenterId = null;
        let targetCostCenterId = null;

        if (updatedBalance - costCenterToUpdate.balance > 0) {
          targetCostCenterId = costCenterToUpdate.id
        } else {
          sourceCostCenterId = costCenterToUpdate.id
        }

        const amount = updatedBalance - costCenterToUpdate.balance;

        await transactionService.create({
          sourceBankAccountId: this.account.id,
          targetBankAccountId: this.account.id,
          sourceCostCenterId,
          targetCostCenterId,
          amount: amount < 0 ? amount * -1 : amount,
          dateString: new Date().toISOString(),
          dueDateString: new Date().toISOString(),
          transactionType: "AccountTransfer",
          executed: true,
          isCashTransaction: false,
        });

        this.selectedCostCenterId = null;

        this.$emit('reload');
      } catch (error) {
        console.error(error);
      }
    },

    async saveNewCostCenter() {
      try {
        const createdCostCenter = await costCenterService.create({
          name: this.newCostCenterName,
          userId: this.user.id,
        });

        if (numberService.parseFloat(this.newCostCenterAmount) !== 0) {
          const costCenterAmount = numberService.parseFloat(this.newCostCenterAmount);
          let sourceCostCenterId = null;
          let targetCostCenterId = null;

          if (costCenterAmount > 0) {
            targetCostCenterId = createdCostCenter.id
          } else {
            sourceCostCenterId = createdCostCenter.id
          }

          await transactionService.create({
            sourceBankAccountId: this.account.id,
            targetBankAccountId: this.account.id,
            sourceCostCenterId,
            targetCostCenterId,
            amount: costCenterAmount < 0 ? costCenterAmount * -1 : costCenterAmount,
            dateString: new Date().toISOString(),
            dueDateString: new Date().toISOString(),
            transactionType: "AccountTransfer",
            executed: true,
            isCashTransaction: false,
          });
        }

        this.createNewCostCenter = false;
        this.newCostCenterName = null;
        this.newCostCenterAmount = null;

        this.$emit('reloadCostCenters');
      }
      catch (error) {
        console.error(error);
      }
    },

    async saveNewCostCenterAsset(costCenterAsset) {
      try {
        costCenterAsset.bankAccountId = this.account.id;
        await costCenterAssetService.create(costCenterAsset);

        this.costCenterIdForAssetCreation = null;

        this.$emit('reloadCostCenters');
      } catch (error) {
        console.error(error);
      }
    },

    updateCostCenterAsset() {
      this.$emit('reloadCostCenters');
      this.selectedCostCenterAssetId = null;
    }
  },

  props: {
    account: {type: Object, required: true},
    costCenters: {type: Array, required: true},
  },

  setup() {
    return {v$: useVuelidate()};
  },

  validations() {
    return {
      newCostCenterAmount: {balanceValidator},
      newCostCenterName: {required},
    };
  },

  watch: {
    createNewCostCenter() {
      if (this.createNewCostCenter) {
        this.costCenterIdForAssetCreation = null;
        this.selectedCostCenterAssetId = null;
        this.selectedCostCenterId = null;
        this.calculateFreeBudget();
        this.v$.$reset();
      }
    },

    newCostCenterAmount() {
      this.v$.newCostCenterAmount.$touch();

      if (!this.v$.newCostCenterAmount.$error) {
        this.calculateFreeBudget();
      }
    },

    newCostCenterName() {
      this.v$.newCostCenterName.$touch();
    }
  }
};

</script>