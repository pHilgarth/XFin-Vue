<template>
  <div class="organism-cost-center-list">
    <MoleculeCostCenterListItem
        v-for="costCenter in costCenters"
        :key="costCenter.id"
        :costCenter="costCenter"
        :selectedCostCenterId="selectedCostCenterId"
        @calculateFreeBudget="calculateFreeBudget"
        @cancelEdit="cancelEdit"
        @edit="selectedCostCenterId = $event"
        @save="save" />
  </div>
</template>

<script>
import MoleculeCostCenterListItem from '@/components/molecules/MoleculeCostCenterListItem';

import {numberService} from "@/services/number-service";
import {transactionService} from "@/services/transaction-service";

export default {
  components: {
    MoleculeCostCenterListItem,
  },

  data() {
    return {
      selectedCostCenterId: null,
    };
  },

  methods: {
    calculateFreeBudget(event) {
      let newFreeBudget = this.account.totalBalance;

      this.costCenters.forEach(c => {
        if (c.id === this.selectedCostCenterId) {
          newFreeBudget -= numberService.parseFloat(event);
        }
        else {
          newFreeBudget -= c.balance;
        }
      });

      this.$emit('updateFreeBudget', newFreeBudget);
    },

    cancelEdit() {
      this.selectedCostCenterId = null;
      this.calculateFreeBudget();
    },

    async save(updatedBalance) {
      try {
        updatedBalance = numberService.parseFloat(updatedBalance);
        const costCenterToUpdate = this.costCenters.find(c => c.id === this.selectedCostCenterId);
        let sourceCostCenterId = null;
        let targetCostCenterId = null;

        if (updatedBalance - costCenterToUpdate.balance > 0) {
          targetCostCenterId = costCenterToUpdate.id
        }
        else {
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
      }
      catch (error) {
        console.error(error);
      }
    }
  },

  props: {
    account: { type: Object, required: true },
    costCenters: { type: Array, required: true },
  },
};

</script>