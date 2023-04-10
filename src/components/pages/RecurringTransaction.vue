<template>
  <div class="recurring-transaction">
    <AtomHeadline tag="h1" text="Wiederkehrende Transaktion" />

    <MoleculeLoading v-if="!dataLoaded" :loadingError="loadingError" errorMessage="Fehler beim Laden der Daten!"/>

    <template v-else>
      <MoleculeTransactionType preselectedOptionId="Revenue" @change="updateTransactionType"/>

      <div class="recurring-transaction__recurring-data">
        <div class="col-md-6 pb-5 pe-3">
          <MoleculeInputAutoSuggest field="cycle" label="Turnus" :required="true" v-model="cycleItem" :items="cycleItems"
                                    :validation="v$.cycleItem" :hasErrors="v$.cycleItem?.$error"
                                    @itemPicked="pickCycleItem" @blur="onBlurCycleItem" />
        </div>

        <div class="col-md-6 pb-5">
          <MoleculeInputText field="day-of-month" v-model="dayOfMonth" label="Tag der Verbuchung" :required="true"
                             :hasErrors="v$.dayOfMonth?.$error" :validation="v$.dayOfMonth" @blur="v$.dayOfMonth?.$touch()" />
        </div>

        <div class="col-md-6 pb-5 pe-3">
          <Datepicker class="vuepic-datepicker vuepic-datepicker--small" :class="v$.startDate.$error ? 'has-errors' : ''" v-model="startDate"
                      placeholder="Ausführung ab" locale="de" format="dd.MM.yyyy" :minDate="new Date()" :maxDate="maxStartDate"
                      :enableTimePicker="false" autoApply />
        </div>

        <div class="col-md-6 pb-5 pe-3">
          <Datepicker class="vuepic-datepicker vuepic-datepicker--small" v-model="endDate" placeholder="Ausführung bis" locale="de"
                      format="dd.MM.yyyy" :minDate="minEndDate" :start-date="minEndDate" :enableTimePicker="false" autoApply />
        </div>
      </div>

      <OrganismTransactionForm
          :costCenters="costCenters"
          :payerAccounts="payerAccounts"
          :payeeAccounts="payeeAccounts"
          :transactionType="transactionType"
          :initialPayeeAccount="payeeAccount"
          :initialPayerAccount="payerAccount"
          @addExternalParty="showExternalPartyForm = true"
          @saveTransaction="saveTransaction"
          @updatePayeeAccounts="updatePayeeAccounts"
      />
    </template>
  </div>
</template>

<script>
import AtomHeadline from "@/components/atoms/AtomHeadline";
import MoleculeInputAutoSuggest from "@/components/molecules/MoleculeInputAutoSuggest";
import MoleculeTransactionType from "@/components/molecules/MoleculeTransactionType";
import MoleculeInputText from "@/components/molecules/MoleculeInputText";
import MoleculeLoading from "@/components/molecules/MoleculeLoading";
import OrganismTransactionForm from "@/components/organisms/OrganismTransactionForm";

import {accountService} from '@/services/account-service';
import {costCenterService} from '@/services/cost-center-service';
import {transactionTypeService} from "@/services/transaction-type-service";

import { dayOfMonthValidator } from '@/validation/custom-validators';

//third party imports
import Datepicker from '@vuepic/vue-datepicker';

import { useVuelidate } from "@vuelidate/core";

import { required } from "@vuelidate/validators";

export default {
  components: {
    AtomHeadline,
    MoleculeInputAutoSuggest,
    MoleculeLoading,
    MoleculeTransactionType,
    MoleculeInputText,
    OrganismTransactionForm,
    Datepicker,
  },

  computed: {
    maxStartDate() {
      const maxStartDate = this.endDate ? new Date(this.endDate) : null;

      if (maxStartDate) {
        maxStartDate.setMonth(maxStartDate.getMonth() - (this.cycleItem.id || 1));
      }

      return maxStartDate;
    },

    minEndDate() {
      let minEndDate = this.startDate ? new Date(this.startDate) : new Date();

      //if startDate has already passed, minEndDate might as well, so I set it to today plus one cycle
      minEndDate = minEndDate < new Date() ? new Date() : minEndDate;

      minEndDate.setMonth(minEndDate.getMonth() + (this.cycleItem?.id || 1));

      return minEndDate;
    },
  },

  async created() {
    try {
      if (this.$cookies.get('user')) {
        this.user = this.$cookies.get('user');
      }

      await this.getData();

      this.dataLoaded = true;
    } catch (error) {
      this.loadingError = true;
    }
  },

  data() {
    return {
      accountHolderNames: null,
      bankAccounts: null,
      costCenters: null,
      cycleItem: null,
      cycleItems: [
        { id: 1, label: 'monatlich' },
        { id: 3, label: 'vierteljährlich' },
        { id: 6, label: 'halbjährlich' },
        { id: 12, label: 'jährlich' },
      ],
      dataLoaded: false,
      dayOfMonth: null,
      endDate: null,
      ibans: null,
      loadingError: false,
      payeeAccount: null,
      payeeAccounts: null,
      payerAccount: null,
      payerAccounts: null,
      showExternalPartyForm: false,
      startDate:  null,
      transactionType: 'Revenue',
    }
  },

  methods: {
    async getData() {
      try {
        const bankAccounts = accountService.getAllByUser(this.user.id);
        //TODO - does this work?
        const costCenters = costCenterService.getAllByUser(this.user.id);

        const bankAccountsResult = await bankAccounts;

        this.ibans = bankAccountsResult.map(p => p.iban);
        this.accountHolderNames = bankAccountsResult.map(p => p.accountHolderName);

        //TODO - place this sort function into service
        this.bankAccounts = bankAccountsResult.sort((a, b) => {
          return a.accountHolderName < b.accountHolderName ? -1 :
              a.accountHolderName === b.accountHolderName ? 0 : 1;
        });

        const filteredAccounts = transactionTypeService.filterAccounts(this.transactionType, this.bankAccounts);
        this.payerAccounts = filteredAccounts.payerAccounts;
        this.payeeAccounts = filteredAccounts.payeeAccounts;

        const costCentersResult = await costCenters;

        this.costCenters = costCentersResult.map(p => {
          return {id: p.id, label: p.name}
        });

      } catch (error) {
        console.error(error);
        throw new Error(error);
      }
    },

    onBlurCycleItem(event) {
      if (this.cycleItem?.label !== event.target.value) {
        this.cycleItem = null;
      }

      this.v$.cycleItem.$touch();
    },

    pickCycleItem() {
      //TODO - not sure, if I need to biuld this method
      console.log('...');
    },

    saveTransaction() {
      //tba
    },

    updatePayeeAccounts() {
      //tba
    },

    updateTransactionType(event) {
      this.transactionType = event.target.id;

      const filteredAccounts = transactionTypeService.filterAccounts(this.transactionType, this.bankAccounts);
      this.payerAccounts = filteredAccounts.payerAccounts;
      this.payeeAccounts = filteredAccounts.payeeAccounts;
    }
  },

  setup() {
    return {
      v$: useVuelidate(),
    };
  },

  validations() {
    return {
      cycleItem: { required },
      dayOfMonth: { dayOfMonthValidator },
      startDate: { required },
    }
  },

  watch: {
    dayOfMonth() {
      this.v$.dayOfMonth.$touch();
    },
  }
}
</script>