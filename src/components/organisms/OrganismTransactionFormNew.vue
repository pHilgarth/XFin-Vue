<template>
  <form class="organism-transaction-form">
    <div class="organism-transaction-form__payer">
      <MoleculeNotice v-if="payeeAndPayerEqual" type="danger" text="Zahlungspflichtiger und Zahlungsempfänger dürfen nicht gleich sein!" />

      <AtomHeadline class="organism-transaction-form__headline mb-3" tag="h4" text="Zahlungspflichtiger" />
      <div class="col-6 pb-5 pe-3">
        <MoleculeInputAutoSuggest field="payer-account" v-model="payerAccount" label="Konto" :required="true" :items="payerAccounts"
                                  :allowNewItems="allowNewPayer" :validation="v$.payerAccount" :hasErrors="v$.payerAccount.$error"
                                  @itemPicked="pickItem($event, 'payerAccount')" @addItem="$emit('addExternalParty')" @blur="onBlurPayerAccount"/>
      </div>

      <div v-if="transactionType !== 'Revenue'" class="col-6 pb-5 ps-3">
        <MoleculeInputAutoSuggest field="payer-cost-center" v-model="payerCostCenter" label="Kostenstelle" :items="payerCostCenters"
                                  :disabled="payerAccount?.external" :validation="v$.payerCostCenter"
                                  :hasErrors="v$.payerCostCenter?.$error" @itemPicked="pickItem($event, 'payerCostCenter')"
                                  @blur="onBlurPayerCostCenter" />

        <MoleculeLoading v-if="payerAccount && payerCostCenter && !payerCostCenterAssetsLoaded"
                         :loadingError="payerCostCenterAssetsLoadingError" errorMessage="Fehler beim Laden der Daten!" />

        <MoleculeInputAutoSuggest v-else-if="payerCostCenterAssetsLoaded" field="payer-cost-center-asset" class="mt-5" label="Posten auf Kostenstelle"
                                  v-model="payerCostCenterAsset" :items="payerCostCenterAssets" @itemPicked="pickItem($event, 'payerCostCenterAsset')"
                                  @blur="onBlurPayerCostCenterAsset" />
      </div>

    </div>

    <div class="organism-transaction-form__payee">
      <AtomHeadline class="organism-transaction-form__headline mb-3" tag="h4" text="Zahlungsempfänger" />
      <div class="col-6 pb-5 pe-3">
        <MoleculeInputAutoSuggest field="payee-account" v-model="payeeAccount" label="Konto" :required="true" :items="payeeAccounts"
                                  :allowNewItems="allowNewPayee" :validation="v$.payeeAccount" :hasErrors="v$.payeeAccount.$error"
                                  @itemPicked="pickItem($event, 'payeeAccount')" @addItem="$emit('addExternalParty')" @blur="onBlurPayeeAccount" />

      </div>

      <div v-if="transactionType !== 'Expense'" class="col-6 pb-5 ps-3">
        <MoleculeInputAutoSuggest field="payee-cost-center" v-model="payeeCostCenter" label="Kostenstelle" :items="payeeCostCenters"
                                  :validation="v$.payeeCostCenter" :hasErrors="v$.payeeCostCenter?.$error"
                                  @itemPicked="pickItem($event, 'payeeCostCenter')" @blur="onBlurPayeeCostCenter" />

        <MoleculeLoading v-if="payeeAccount && payeeCostCenter && !payeeCostCenterAssetsLoaded"
                         :loadingError="payeeCostCenterAssetsLoadingError" errorMessage="Fehler beim Laden der Daten!" />

        <MoleculeInputAutoSuggest v-else-if="payeeCostCenterAssetsLoaded" field="payee-cost-center-asset" class="mt-5" label="Posten auf Kostenstelle"
                                  v-model="payeeCostCenterAsset" :items="payeeCostCenterAssets" :allowNewItems="true" @itemPicked="pickItem($event, 'payeeCostCenterAsset')"
                                  @addItem="$emit('addCostCenterAsset', payeeAccount, payeeCostCenter, payeeCostCenterAssets.map(p => p.name))" @blur="onBlurPayeeCostCenterAsset" />

      </div>
    </div>

    <div class="organism-transaction-form__details">
      <AtomHeadline class="organism-transaction-form__headline mb-3" tag="h4" text="Details" />

      <div class="col-md-6 pb-5 pe-3">
        <MoleculeInputText field="reference" v-model="reference" label="Verwendungszweck" :required="true" :hasErrors="v$.reference.$error"
                           :validation="v$.reference" @blur="v$.reference.$touch()" />
      </div>
      <div class="col-md-6 pb-5 ps-3">
        <MoleculeInputText field="amount" v-model="amount" label="Betrag" :required="true" :hasErrors="v$.amount.$error"
                           :validation="v$.amount" @blur="v$.amount.$touch()"/>
      </div>
    </div>

    <div class="organism-transaction-form__options">
      <AtomHeadline class="organism-transaction-form__headline mb-3" tag="h4" text="Zusätzliche Optionen" />

      <div class="col-md-6 pb-5">
        <MoleculeInputAutoSuggest field="loan" label="Darlehen" noItemsLabel="" v-model="loan" :items="loans"
                                  @itemPicked="pickItem($event, 'loan')" />
      </div>

      <AtomHeadline class="organism-transaction-form__headline mb-3" tag="h5" text="Wiederkehrende Transaktion" />

      <!-- TODO - see paragraph -->
      <p style="color:red">ich muss hier noch die Möglichkeit für ein Start- und Enddatum anbieten</p>

      <div class="organism-transaction-form__recurring-transaction">
        <MoleculeInputCheckbox class="col-md-12 pb-3" v-model="recurringTransaction" label="Wiederkehrende Transaktion" />
        <div class="col-md-6 pb-5 pe-3">
          <MoleculeInputAutoSuggest field="cycle" label="Turnus" :required="recurringTransaction" v-model="cycleItem" :items="cycleItems"
                                    :validation="v$.cycleItem" :hasErrors="v$.cycleItem?.$error" :disabled="!recurringTransaction"
                                    @itemPicked="pickItem($event, 'cycleItem')" @blur="onBlurCycleItem" />
        </div>

        <div class="col-md-6 pb-5 ps-3">
          <MoleculeInputText field="day-of-month" v-model="dayOfMonth" label="Tag der Verbuchung" :required="recurringTransaction"
                             :hasErrors="v$.dayOfMonth?.$error"
                             :validation="v$.dayOfMonth" :disabled="!recurringTransaction" @blur="v$.dayOfMonth?.$touch()" />
        </div>

      </div>
    </div>

    <AtomButton :disabled="v$.$invalid || payeeAndPayerEqual" type="primary" text="Speichern" @click.prevent="saveTransaction" />

  </form>
</template>

<script>
import AtomButton from '@/components/atoms/AtomButton';
import AtomHeadline from '@/components/atoms/AtomHeadline';
import MoleculeInputAutoSuggest from '@/components/molecules/MoleculeInputAutoSuggest';
import MoleculeInputCheckbox from "../molecules/MoleculeInputCheckbox";
import MoleculeInputText from '@/components/molecules/MoleculeInputText';
import MoleculeLoading from "@/components/molecules/MoleculeLoading";
import MoleculeNotice from "../molecules/MoleculeNotice";

import { copyService } from '@/services/copy-service';
import { costCenterAssetService } from "@/services/cost-center-asset-service";
import { loanService } from '@/services/loan-service';
import { numberService } from '@/services/number-service';
import { reserveService } from '@/services/reserve-service';

import { transactionValidation } from '@/validation/validations';
import { dayOfMonthValidator } from '@/validation/custom-validators';
import { useVuelidate } from "@vuelidate/core";
import { required } from "@vuelidate/validators";


export default {
  components: {
    AtomButton,
    AtomHeadline,
    MoleculeInputAutoSuggest,
    MoleculeInputCheckbox,
    MoleculeInputText,
    MoleculeLoading,
    MoleculeNotice,
  },

  props: {
    bankAccounts: { type: Array, required: true },
    costCenterAsset: { type: Object },
    costCenters: { type: Array, required: true },
    initialPayeeAccount: { type: Object },
    newPayeeCostCenterAsset: { type: Object },
    initialPayerAccount: { type: Object },
    payeeAccounts: { type: Array, required: true},
    payerAccounts: { type: Array, required: true },
    transactionType: { type: String, required: true },
  },

  data() {
    return {
      amount: null,
      cycleItem: null,
      cycleItems: [
        { id: 1, label: 'monatlich' },
        { id: 3, label: 'vierteljährlich' },
        { id: 6, label: 'halbjährlich' },
        { id: 12, label: 'jährlich' },
      ],
      dataLoaded: false,
      dayOfMonth: null,
      filteredTransactionTypeItems: null,
      loadingError: false,
      loan: null,
      loans: [],
      payeeAccount: this.initialPayeeAccount || null,
      payeeCostCenter: this.initialPayeeCostCenter || null,
      payeeCostCenters: copyService.copyArray(this.costCenters),
      payeeCostCenterAsset: null,
      payeeCostCenterAssets: null,
      payeeCostCenterAssetsLoaded: false,
      payeeCostCenterAssetsLoadingError: false,
      payeeReserves: null,
      payerAccount: this.initialPayerAccount || null,
      payerCostCenter: this.initialPayerCostCenter || null,
      payerCostCenters: copyService.copyArray(this.costCenters),
      payerCostCenterAsset: null,
      payerCostCenterAssets: null,
      payerCostCenterAssetsLoaded: false,
      payerCostCenterAssetsLoadingError: false,
      payerReserves: null,
      recurringTransaction: false,
      reference: null,
    }
  },

  computed: {
    allowNewPayee() {
      return this.transactionType === 'Exppense';
    },

    allowNewPayer() {
      return this.transactionType === 'Revenue'
    },

    payeeAndPayerEqual() {
      if (this.payeeAccount && this.payeeCostCenter && this.payerAccount && this.payerCostCenter) {
        return this.payeeAccount.id === this.payerAccount.id && this.payeeCostCenter.id === this.payerCostCenter.id;
      }
      else if (this.payeeAccount && this.payerAccount && !this.payeeCostCenter && !this.payerCostCenter) {
        return this.payeeAccount.id === this.payerAccount.id;
      }

      return false;
    }
  },

  watch: {
    amount() {
      this.v$.amount.$touch();
    },

    dayOfMonth() {
      this.v$.dayOfMonth.$touch();
    },

    initialPayeeAccount() {
      this.payeeAccount = this.initialPayeeAccount;
    },

    initialPayeeCostCenter() {
      this.payeeCostCenter = this.initialPayeeCostCenter;
    },

    initialPayerAccount() {
      this.payerAccount = this.initialPayerAccount;
    },

    initialPayerCostCenter() {
      this.payerCostCenter = this.initialPayerCostCenter;
    },

    newPayeeCostCenterAsset() {
      this.payeeCostCenterAsset = this.newPayeeCostCenterAsset;

      this.payeeCostCenterAssets = Array.from([
        this.payeeCostCenterAssets.filter(p => !p.new),
        this.payeeCostCenterAsset
      ]).flat();
    },

    payeeAccount() {
      this.updateCostCenterAssets();
      this.fetchLoans();
    },

    payeeAccounts() {
      this.v$.$reset();
    },

    payeeCostCenter() {
      this.updateCostCenterAssets();
    },

    payeeCostCenterAsset() {
      if (this.payeeCostCenterAsset?.isReserve && this.payerCostCenterAssets) {
        this.payerCostCenterAssets = this.payerCostCenterAssets.filter(p => !p.isReserve);
      }
    },

    payerAccount() {
      this.updateCostCenterAssets();
      this.fetchLoans();
    },

    payerAccounts() {
      this.v$.$reset();
    },

    payerCostCenter() {
      this.updateCostCenterAssets();
    },

    payerCostCenterAsset() {
      if (this.payerCostCenterAsset?.isReserve && this.payeeCostCenterAssets) {
        this.payeeCostCenterAssets = this.payeeCostCenterAssets.filter(p => !p.isReserve);
      }
    },

    reference() {
      this.v$.reference.$touch();
    },

    transactionType() {
      this.v$.$reset();

      this.amount = null;
      this.cycleItem = null;
      this.dayOfMonth = null;
      this.loan = null;
      this.payeeAccount = null;
      this.payeeCostCenter = null;
      this.payeeCostCenterAsset = null;
      this.payerAccount = null;
      this.payerCostCenter = null;
      this.payerCostCenterAsset = null;
      this.recurringTransaction = false;
      this.reference = null;
    },
  },

  methods: {
    async fetchLoans() {
      if (this.payeeAccount && this.payerAccount) {
        try {
          const loans = await loanService.getAllByCreditorAndDebitor(this.payerAccount.id, this.payeeAccount.id);

          this.fullLoans = loans;
          this.loans = loans.map(l => { return { id: l.id, label: l.reference} });
        }
        catch (error) {
          console.error(error);
        }
      }
    },

    async fetchPayeeCostCenterAssets() {
      try {
        const payeeCostCenterAssets = costCenterAssetService.getAllByAccountAndCostCenter(this.payeeAccount.id, this.payeeCostCenter.id);
        const reserves = reserveService.getAllByAccountAndCostCenter(this.payeeAccount.id, this.payeeCostCenter.id);

        const payeeCostCenterAssetsResult = await payeeCostCenterAssets;
        this.payeeReserves = await reserves;

        this.payeeCostCenterAssets = Array.from([
            payeeCostCenterAssetsResult.map(p => { return { id: p.id, label: p.name, amount: p.amount }} ),
            this.payeeReserves.map(p => { return { id: `reserve-${p.id}`, label: `${p.reference} (Rücklage)`, isReserve: true }} ),
        ]).flat();

        this.payeeCostCenterAssetsLoaded = true;
      } catch (error) {
        console.error(`Error fetching costCenterAssets (${error})`);
        this.payeeCostCenterAssetsLoadingError = true;
      }
    },

    async fetchPayerCostCenterAssets() {
      try {
        const payerCostCenterAssets = costCenterAssetService.getAllByAccountAndCostCenter(this.payerAccount.id, this.payerCostCenter.id);
        const reserves = reserveService.getAllByAccountAndCostCenter(this.payerAccount.id, this.payerCostCenter.id);

        const payerCostCenterAssetsResult = await payerCostCenterAssets;
        this.payerReserves = await reserves;

        this.payerCostCenterAssets = Array.from([
          payerCostCenterAssetsResult.map(p => { return { id: p.id, label: p.name, amount: p.amount }} ),
          this.payerReserves.map(p => { return { id: `reserve-${p.id}`, label: `${p.reference} (Rücklage)`, isReserve: true }} ),
        ]).flat();

        this.payerCostCenterAssetsLoaded = true;
      } catch (error) {
        console.log(`Error fetching costCenterAssets (${error})`);
        this.payerCostCenterAssetsLoadingError = true;
      }
    },

    onBlurCycleItem(event) {
      if (this.cycleItem?.label !== event.target.value) {
        this.cycleItem = null;
      }

      this.v$.cycleItem.$touch();
    },

    onBlurPayeeAccount(event) {
      if (this.payeeAccount?.label !== event.target.value) {
        this.payeeAccount = null;
      }

      this.v$.payeeAccount.$touch();
    },

    onBlurPayeeCostCenter(event) {
      if (this.payeeCostCenter?.label !== event.target.value) {
        this.payeeCostCenter = null;
      }

      this.v$.payeeCostCenter?.$touch();
    },

    onBlurPayeeCostCenterAsset(event) {
      if (this.payeeCostCenterAsset?.label !== event.target.value) {
        this.payeeCostCenterAsset = null;
      }
    },

    onBlurPayerAccount(event) {
      if (this.payerAccount?.label !== event.target.value) {
        this.payerAccount = null;
      }

      this.v$.payerAccount.$touch();
    },

    onBlurPayerCostCenter(event) {
      if (this.payerCostCenter?.label !== event.target.value) {
        this.payerCostCenter = null;
      }

      this.v$.payerCostCenter?.$touch();
    },

    onBlurPayerCostCenterAsset(event) {
      if (this.payerCostCenterAsset?.label !== event.target.value) {
        this.payerCostCenterAsset = null;
      }
    },

    pickItem(id, property, findIn) {
      this[property] = this[`${findIn || property + 's'}`].find(p => p.id == id);
    },

    saveTransaction() {
      this.v$.$touch();

      if (!this.v$.$error && !this.payeeAndPayerEqual) {
        //TODO - ugly... refactoring? look these ternaries....
        const newTransaction = {
          sourceBankAccountId: this.payerAccount.id,
          targetBankAccountId: this.payeeAccount.id,
          sourceCostCenterId: this.payerCostCenter?.id,
          sourceCostCenterAsset: this.payerCostCenterAsset?.isReserve ? null : this.payerCostCenterAsset,
          targetCostCenterId: this.payeeCostCenter?.id,
          targetCostCenterAsset: this.payeeCostCenterAsset?.isReserve ? null : this.payeeCostCenterAsset,
          //TODO - einmalig geplante transactions einführen! (Datum auswählen, wann verbucht werden soll) Muss dann auch auf der Startseite bestätigt werden
          dueDateString: new Date().toISOString(),
          dateString: new Date().toISOString(),
          reserve: this.payerCostCenterAsset?.isReserve
              ? this.payerCostCenterAsset
              : this.payeeCostCenterAsset?.isReserve
                  ? this.payeeCostCenterAsset
                  : null,
          loan: this.fullLoans.find(l => l.id === this.loan?.id),
          loanId: this.loan?.id,
          reference: this.reference,
          amount: numberService.parseFloat(this.amount),
          transactionType: this.transactionType,
        };

        //TODO - i need to change this, that's not good
        if (newTransaction.sourceCostCenterAsset || newTransaction.targetCostCenterAsset) {
          newTransaction.updateCostCenterAssets = true;
        }

        if (this.recurringTransaction) {
          newTransaction.isRecurring = true;
          newTransaction.cycle = this.cycleItem.id;
          newTransaction.dayOfMonth = this.dayOfMonth;
        }

        this.$emit('saveTransaction', newTransaction);
      }
      else if (this.payeeAndPayerEqual) {
        alert('Zahlungspflichtiger und Zahlungsempfänger müssen sich unterscheiden!');
      }
    },

    updateCostCenterAssets() {
      this.payeeCostCenterAsset = null;

      if (this.transactionType === 'Expense') {
        this.updatePayerCostCenterAssets();
      }
      else if (this.transactionType === 'Revenue') {
        this.updatePayeeCostCenterAssets();
      }
      else if (this.transactionType === 'Transfer') {
        this.updatePayerCostCenterAssets();
        this.updatePayeeCostCenterAssets();
      }
    },

    updatePayeeCostCenterAssets() {
      if (this.payeeAccount && this.payeeCostCenter) {
        this.fetchPayeeCostCenterAssets();
      }
      else {
        this.payeeCostCenterAssetsLoaded = false;
      }
    },

    updatePayerCostCenterAssets() {
      if (this.payerAccount && this.payerCostCenter) {
        this.fetchPayerCostCenterAssets();
      }
      else {
        this.payerCostCenterAssetsLoaded = false;
      }
    }
  },

  setup() {
    return {
      v$: useVuelidate(),
    };
  },

  validations() {
    const validation = copyService.copyObject(transactionValidation);

    if (this.recurringTransaction) {
      validation.cycleItem = { required };
      validation.dayOfMonth = { dayOfMonthValidator, required }
    }

    return validation;
  },
};

</script>