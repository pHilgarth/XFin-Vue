<template>
  <form class="organism-transaction-form">
    <div class="organism-transaction-form__payer">
<!--      <p style="color:red">evtl. etwas einbauen, um Datensätze, die hier in der Form neu erstellt wurden wieder zu löschen, wenn die Transaktion im Endeffekt nicht abgeschickt wird (neue Zahlungsempfänger / -pflichtige oder CostCenterAssets)</p>-->
<!--      <p style="color:red">Filterung der TransactionTypeItems funktioniert bei Ausgabe noch nicht, bzw. gibt es einen Fehler, wenn Einnahme und Sparrate ausgewählt ist und auf Ausgabe geswitcht wird</p>-->
      <AtomHeadline class="organism-transaction-form__headline" tag="h5" text="Zahlungspflichtiger" />
      <div class="col-6 pb-5 pe-3">
<!--        <p>Bug! Wenn ein Item bei Einnahme ausgewählt wird und dann auf Ausgabe geswitcht wird, bleibt das Item ausgewählt</p>-->
        <MoleculeInputAutoSuggest field="payer-account" v-model="payerAccount" label="Konto" :required="true" :items="payerAccounts"
                                  :allowNewItems="allowNewPayer" :validation="v$.payerAccount" :hasErrors="v$.payerAccount.$error"
                                  @itemPicked="pickItem($event, 'payerAccount')" @addItem="$emit('addExternalParty')" @blur="onBlurPayerAccount"/>

      </div>

<!--      <p>costCenterAssets: hier sind noch Fehler, z.B. beim Herauslöschen des ausgewählten Items und wenn die Kostenstelle gelöscht wird - dann muss das Feld für Assets wieder verschwinden</p>-->
      <div v-if="transactionDirection !== 'revenue'" class="col-6 pb-5 ps-3">
        <MoleculeInputAutoSuggest field="payer-cost-center" v-model="payerCostCenter" label="Kostenstelle" :required="payerAccount && !payerAccount.external"
                                  :allowNewItems="true" :items="costCenters" :disabled="payerAccount?.external"
                                  :validation="v$.payerCostCenter" :hasErrors="v$.payerCostCenter.$error"
                                  @itemPicked="pickItem($event, 'payerCostCenter', 'costCenters')" @addItem="$emit('addPayerCostCenter')"
                                  @blur="v$.payerCostCenter.$touch()" />

        <MoleculeLoading v-if="payerCostCenter && !payerCostCenterAssetsLoaded"
                         :loadingError="payerCostCenterAssetsLoadingError" errorMessage="Fehler beim Laden der Daten!" />

        <MoleculeInputAutoSuggest v-else-if="payerCostCenterAssetsLoaded" field="payer-cost-center-asset" class="mt-5" label="Posten auf Kostenstelle"
                                  v-model="payerCostCenterAsset" :items="payerCostCenterAssets" :allowNewItems="true" @itemPicked="pickItem($event, 'payerCostCenterAsset')"
                                  @addItem="$emit('addPayerCostCenterAsset', payerCostCenter, payerCostCenterAssets.map(p => p.name))" />
        <!-- TODO -                                                  I'm not sure if passing multiple parameters works like that -->
      </div>

    </div>

    <div class="organism-transaction-form__payee">
      <AtomHeadline class="organism-transaction-form__headline" tag="h5" text="Zahlungsempfänger" />
<!--      <p>Bug: wenn kein Eintrag gefunden wurde (z.B. Peter eingegeben wird) und dann auf "(kein Eintrag gefunden)" geklickt wird, öffnet sich die Neue Eintrag Maske</p>-->
<!--      <p>Bug: wenn bei Einnahme ein Empfängerkonto ausgewählt wird, kann ich "Entnahme aus Sparrate" wählen</p>-->
<!--      <h4>Nächster Schritt: Entnahmen aus Rücklagen? Kann ich nicht als TransactionType machen, da ich auch eine Tilgung mit einer Entnahme aus einer Rücklage tätigen kann</h4>-->
      <div class="col-6 pb-5 pe-3">
        <!-- TODO - the "new"-item only appears after a blur, when switched from revenue to exepnse -->
<!--        <p>Bug! Wenn ein Item bei Einnahme ausgewählt wird und dann auf Ausgabe geswitcht wird, bleibt das Item ausgewählt</p>-->
        <MoleculeInputAutoSuggest field="payee-account" v-model="payeeAccount" label="Konto" :items="payeeAccounts"
                                  :allowNewItems="allowNewPayee" :validation="v$.payeeAccount" :hasErrors="v$.payeeAccount.$error"
                                  @itemPicked="pickItem($event, 'payeeAccount')" @addItem="$emit('addExternalParty')" @blur="onBlurPayeeAccount" />

      </div>

      <div v-if="transactionDirection !== 'expense'" class="col-6 pb-5 ps-3">
<!--        <p>muss zum Pflichtfeld werden, wenn (Einnahme || Umbuchung) && transactionType == reserve || loan (Validation fehlt also noch)</p>-->
        <MoleculeInputAutoSuggest field="payee-cost-center" v-model="payeeCostCenter" label="Kostenstelle" :items="costCenters"
                                  :allowNewItems="true" :disabled="itsDisabled" @itemPicked="pickItem($event, 'payeeCostCenter', 'costCenters')"
                                  @addItem="$emit('addPayeeCostCenter')" />

        <MoleculeLoading v-if="payeeCostCenter && !payeeCostCenterAssetsLoaded"
                         :loadingError="payeeCostCenterAssetsLoadingError" errorMessage="Fehler beim Laden der Daten!" />

        <MoleculeInputAutoSuggest v-else-if="payeeCostCenterAssetsLoaded" field="payee-cost-center-asset" class="mt-5" label="Posten auf Kostenstelle"
                                  v-model="payeeCostCenterAsset" :items="payeeCostCenterAssets" :allowNewItems="true" @itemPicked="pickItem($event, 'payeeCostCenterAsset')"
                                  @addItem="$emit('addPayeeCostCenterAsset', payeeCostCenter, payeeCostCenterAssets.map(p => p.name))" />
        <!-- TODO -                                                  I'm not sure if passing multiple parameters works like that -->

      </div>
    </div>

    <div class="organism-transaction-form__details">
      <AtomHeadline class="organism-transaction-form__headline" tag="h4" text="Details" />

      <div class="col-6 pb-5 pe-3">
        <MoleculeInputAutoSuggest field="transaction-type" v-model="transactionType" label="Transaktionstyp" :items="transactionTypes"
                                  :validation="v$.transactionType" :hasErrors="v$.transactionType.$error"
                                  @blur="v$.transactionType.$touch()" @itemPicked="pickItem($event, 'transactionType')" />
<!--        <h5>sobald Sparrate ausgewählt wurde, muss Empfänger-Kostenstelle ein Pflichtfeld sein!</h5>-->
      </div>

      <div class="col-md-6 ps-3">
        <MoleculeLoading v-if="(transactionType && transactionType.id !== 'default') && !transactionTypeItemsLoaded"
                         :loadingError="transactionTypeItemsLoadingError" errorMessage="Fehler beim Laden der Daten!" />


        <MoleculeInputAutoSuggest v-else-if="(transactionType && transactionType.id !== 'default') && transactionTypeItemsLoaded && transactionTypeItems.length > 0"
                                  field="transaction-type-item" v-model="transactionTypeItem" label="Darlehen/Rücklage -> make this dynamic!"
                                  :items="filteredTransactionTypeItems" :validation="v$.transactionTypeItem" :hasErrors="v$.transactionTypeItem.$error"
                                  @blur="v$.transactionTypeItem.$touch()" />
      </div>
      <div class="col-md-6 pb-5 pe-3">
        <MoleculeInputText field="reference" v-model="reference" label="Verwendungszweck" :hasErrors="v$.reference.$error"
                           :validation="v$.reference" @blur="v$.reference.$touch()" />
      </div>
      <div class="col-md-6 pb-5 ps-3">
        <MoleculeInputText field="amount" v-model="amount" label="Betrag" :hasErrors="v$.amount.$error" :validation="v$.amount" @blur="v$.amount.$touch()"/>
      </div>
    </div>

<!--    <pre>{{ payerAccount }}</pre>-->

    <AtomButton type="primary" text="Speichern" @click.prevent="saveTransaction" />

  </form>
</template>

<script>
import AtomButton from '@/components/atoms/AtomButton';
import AtomHeadline from '@/components/atoms/AtomHeadline';
import MoleculeInputAutoSuggest from '@/components/molecules/MoleculeInputAutoSuggest';
import MoleculeInputText from '@/components/molecules/MoleculeInputText';
import MoleculeLoading from "@/components/molecules/MoleculeLoading";

import { copyService } from '@/services/copy-service';
import { CostCenterAssetService } from "@/services/cost-center-asset-service";
import { NumberService } from '@/services/number-service';
import { reserveService } from '@/services/reserve-service';
import { TransactionService } from '@/services/transaction-service';
import { TransactionTypeService } from '@/services/transaction-type-service';

import { transactionValidation } from '@/validation/validations';
import { payerCostCenterValidator } from '@/validation/custom-validators';
import { useVuelidate } from "@vuelidate/core";

export default {
  components: {
    AtomButton,
    AtomHeadline,
    MoleculeInputAutoSuggest,
    MoleculeInputText,
    MoleculeLoading,
  },

  props: {
    bankAccounts: { type: Array, required: true },
    costCenterAsset: { type: Object },
    costCenters: { type: Array, required: true },
    initialPayeeAccount: { type: Object },
    initialPayeeCostCenter: { type: Object },
    initialPayeeCostCenterAsset: { type: Object },
    initialPayerAccount: { type: Object },
    initialPayerCostCenter: { type: Object },
    initialPayerCostCenterAsset: { type: Object },
    payeeAccounts: { type: Array, required: true},
    payerAccounts: { type: Array, required: true },
    transactionDirection: { type: String, required: true },
  },

  data() {
    return {
      itsDisabled: false,
      amount: null,
      dataLoaded: false,
      filteredTransactionTypeItems: null,
      loadingError: false,
      payeeAccount: this.initialPayeeAccount || null,
      payeeCostCenter: this.initialPayeeCostCenter || null,
      payeeCostCenterAsset: null,
      payeeCostCenterAssets: null,
      payeeCostCenterAssetsLoaded: false,
      payeeCostCenterAssetsLoadingError: false,
      payerAccount: this.initialPayerAccount || null,
      payerCostCenter: this.initialPayerCostCenter || null,
      payerCostCenterAsset: null,
      payerCostCenterAssets: null,
      payerCostCenterAssetsLoaded: false,
      payerCostCenterAssetsLoadingError: false,
      reference: null,
      transactionType: null,
      transactionTypeItem: null,
      transactionTypeItems: null,
      transactionTypeItemsLoaded: false,
      transactionTypeItemsLoadingError: false,

      transactionTypes: copyService.copyArray(TransactionTypeService.transactionTypes)
          .map(t => { return { id: t.value, label: t.label } }),

      // payeeAccounts: copyService.copyArray(this.bankAccounts).map(
      //     p => { return { id: p.id, label: `${p.accountHolderName} (${p.iban})`, external: p.external} }),
      // payeeCostCenters: copyService.copyArray(this.costCenters).map(
      //     p => { return { id: p.id, label: p.name } }),
      //payerAccounts: copyService.copyArray(this.bankAccounts).map(
          //p => { return { id: p.id, label: `${p.accountHolderName} (${p.iban})`, external: p.external} }),
      // payerCostCenters: copyService.copyArray(this.costCenters).map(
      //     p => { return { id: p.id, label: p.name}}),
    }
  },

  computed: {
    allowNewPayee() {
      return this.transactionDirection === 'expense';
    },

    allowNewPayer() {
      return this.transactionDirection === 'revenue'
    },
  },

  watch: {
    amount() {
      this.v$.amount.$touch();
    },

    initialPayeeAccount() {
      this.payeeAccount = this.initialPayeeAccount;
    },

    initialPayeeCostCenter() {
      this.payeeCostCenter = this.initialPayeeCostCenter;
    },

    initialPayeeCostCenterAsset() {
      this.payeeCostCenterAsset = this.initialPayeeCostCenterAsset;
    },

    initialPayerAccount() {
      this.payerAccount = this.initialPayerAccount;
    },

    initialPayerCostCenter() {
      this.payerCostCenter = this.initialPayerCostCenter;
    },

    initialPayerCostCenterAsset() {
      this.payerCostCenterAsset = this.initialPayerCostCenterAsset;
    },

    payeeAccounts() {
      this.v$.$reset();
    },

    payerAccounts() {
      this.v$.$reset();
    },

    payeeAccount() {
      if (this.transactionTypeItems) {
        if (this.transactionTypeItem &&
            this.transactionTypeItems.find(t => t.id === this.transactionTypeItem.id).bankAccount.id !== this.payeeAccount.id) {
          this.v$.transactionTypeItem.$reset();
          this.transactionTypeItem = null;
        }

        this.filterTransactionTypeItems();
      }

      //if (this.payeeAccount) {
        // this.payerAccounts = copyService.copyArray(this.bankAccounts).map(
        //     p => { return { id: p.id, label: `${p.accountHolderName} (${p.iban})`, external: p.external} });

        // this.payerAccounts = this.payeeAccount.external
        //     ? this.payerAccounts.filter(p => p.id !== this.payeeAccount.id && !p.external)
        //     : this.payerAccounts.filter(p => p.id !== this.payeeAccount.id);

        // this.transactionTypes = this.payeeAccount.external
        //   ? this.transactionTypes.filter(t => t.id !== 'reserve')
        //   : copyService.copyArray(TransactionTypeService.transactionTypes).map(
        //         t => { return { id: t.value, label: t.label } });
      //}
      //else {
        // this.transactionTypes = copyService.copyArray(TransactionTypeService.transactionTypes).map(
        //     t => { return { id: t.value, label: t.label } });

        // this.payerAccounts = copyService.copyArray(this.bankAccounts).map(
        //     p => { return { id: p.id, label: `${p.accountHolderName} (${p.iban})`, external: p.external} });

        // if (this.payerAccount) {
        //   this.payerAccounts = this.payerAccounts.filter(p => p.id !== this.payerAccount.id);
        // }
      //}
    },

    payeeCostCenter() {
      if (this.transactionTypeItems) {
        if (this.transactionTypeItem &&
            this.transactionTypeItems.find(t => t.id === this.transactionTypeItem.id).costCenter.id !== this.payeeCostCenter.id) {
          this.v$.transactionTypeItem.$reset();
          this.transactionTypeItem = null;
        }

        this.filterTransactionTypeItems();
      }

      if (this.payeeCostCenter) {
        if (this.payeeCostCenter.id === 'new') {
          this.payeeCostCenterAssetsLoaded = true;
          this.payeeCostCenterAssets = [];
        }
        else {
          this.fetchPayeeCostCenterAssets();
        }
      }
    },

    payeeCostCenterAsset() {
      //TODO - sort payeeCostCenterAssets alphabetically
      if (this.payeeCostCenterAsset) {
        this.payeeCostCenterAssets = Array.from([
            this.payeeCostCenterAssets.filter(p => !p.new),
            this.payeeCostCenterAsset
        ]).flat();
      }
    },

    payerAccount() {
      if (this.payerAccount) {
        // this.payeeAccounts = copyService.copyArray(this.bankAccounts).map(
        //     p => { return { id: p.id, label: `${p.accountHolderName} (${p.iban})`, external: p.external} });
        //
        // this.payeeAccounts = this.payerAccount.external
        //     ? this.payeeAccounts.filter(p => p.id !== this.payerAccount.id && !p.external)
        //     : this.payeeAccounts.filter(p => p.id !== this.payerAccount.id);
        //
        // if (this.transactionType && this.transactionType.id === 'reserve') {
        //   this.payeeAccounts = this.payeeAccounts.filter(p => !p.external);
        // }
      }
      else {
        // this.payeeAccounts = copyService.copyArray(this.bankAccounts).map(
        //     p => { return { id: p.id, label: `${p.accountHolderName} (${p.iban})`, external: p.external} });
        //
        // if (this.payeeAccount) {
        //   this.payeeAccounts = this.payeeAccounts.filter(p => p.id !== this.payeeAccount.id);
        // }
        //
        // if (this.transactionType && this.transactionType.id === 'reserve') {
        //   this.payeeAccounts = this.payeeAccounts.filter(p => !p.external);
        // }
      }
    },

    payerCostCenter() {
      if (this.transactionTypeItems) {
        if (this.transactionTypeItem &&
            this.transactionTypeItems.find(t => t.id === this.transactionTypeItem.id).costCenter.id !== this.payerCostCenter.id) {
          this.v$.transactionTypeItem.$reset();
          this.transactionTypeItem = null;
        }

        this.filterTransactionTypeItems();
      }

      if (this.payerCostCenter) {
        if (this.payerCostCenter.id === 'new') {
          this.payeeCostCenterAssetsLoaded = true;
          this.payeeCostCenterAssets = [];
        }
        else {
          this.fetchPayerCostCenterAssets();
        }
      }
    },

    payerCostCenterAsset() {
      //TODO - sort payeeCostCenterAssets alphabetically
      this.payerCostCenterAssets = Array.from([
        this.payerCostCenterAssets.filter(p => !p.new),
        this.payerCostCenterAsset
      ]).flat();
    },

    reference() {
      this.v$.reference.$touch();
    },

    transactionDirection() {
      if (this.transactionDirection === 'reserve') {
        this.transactionTypes = copyService.copyArray(TransactionTypeService.transactionTypes)
            .map(t => { return { id: t.value, label: t.label } });
      }
      else if (this.transactionDirection === 'expense') {
        this.transactionTypes = copyService.copyArray(TransactionTypeService.transactionTypes)
            .map(t => { return { id: t.value, label: t.label } })
            .filter(t => t.id !== 'reserve');
      }
      else {
        this.transactionTypes = copyService.copyArray(TransactionTypeService.transactionTypes)
            .map(t => { return { id: t.value, label: t.label } });
      }
    },

    transactionType() {
      if (this.transactionType && this.transactionType.id === 'reserve') {
        this.fetchTransactionTypeItems();
      }
      else if (this.transactionType && this.transactionType !== 'reserve') {
        // this.payeeAccounts = copyService.copyArray(this.bankAccounts).map(
        //     p => { return { id: p.id, label: `${p.accountHolderName} (${p.iban})`, external: p.external} });

        // if (this.payerAccount) {
        //   this.payeeAccounts = this.payerAccount.external
        //       ? this.payeeAccounts.filter(p => !p.external && p.id !== this.payerAccount.id)
        //       : this.payeeAccounts.filter(p => p.id !== this.payerAccount.id);
        // }
        //
        // if (this.payeeAccount) {
        //   this.payeeAccounts = this.payeeAccounts.filter(p => p.id !== this.payeeAccount.id);
        // }
      }
    },

    transactionTypeItem() {
      if (this.transactionType.id === 'reserve' && this.transactionTypeItem) {
        this.payeeAccount = this.payeeAccounts.find(
            p => p.id === this.transactionTypeItems.find(t => t.id === this.transactionTypeItem.id).bankAccount.id);

        this.payeeCostCenter = this.costCenters.find(
            p => p.id === this.transactionTypeItems.find(t => t.id === this.transactionTypeItem.id).costCenter.id);
      }
      //this.transactionTypeItems.find(t => t.id === this.transactionTypeItem.id).bankAccount
    }
  },

  methods: {
    async fetchPayeeCostCenterAssets() {
      try {
        this.payeeCostCenterAssets = await CostCenterAssetService.getAllByCostCenter(this.payeeCostCenter.id);
        this.payeeCostCenterAssets = this.payeeCostCenterAssets.map(p => { return { id: p.id, label: p.name, amount: p.amount }} );

        this.payeeCostCenterAssetsLoaded = true;
      } catch (error) {
        console.log(`Error fetching costCenterAssets (${error})`);
        this.payeeCostCenterAssetsLoadingError = true;
      }
    },

    async fetchPayerCostCenterAssets() {
      try {
        this.payerCostCenterAssets = await CostCenterAssetService.getAllByCostCenter(this.payerCostCenter.id);
        this.payerCostCenterAssets = this.payerCostCenterAssets.map(p => { return { id: p.id, label: p.name, amount: p.amount }} );

        this.payerCostCenterAssetsLoaded = true;
      } catch (error) {
        console.log(`Error fetching costCenterAssets (${error})`);
        this.payerCostCenterAssetsLoadingError = true;
      }
    },

    async fetchTransactionTypeItems() {
      try {
        this.transactionTypeItems = await reserveService.getAll();

        this.filterTransactionTypeItems();

        this.transactionTypeItemsLoaded = true;
      } catch (error) {
        console.log(`Error while fetching TransactionTypeItems in OrganismTransactionFormNew!!! (${error})`);
        this.transactionTypeItemsLoadingError = true;
      }
    },

    filterTransactionTypeItems() {
      let property = '';

      if (this.transactionDirection === 'revenue') {
        property = 'payee';
      }
      else if (this.transactionDirection === 'expense') {
        property = 'payer';
      }
      else {
        property = this.transactionType === 'loan' || this.transactionType === 'reserve'
            ? 'payee'
            : 'payer'
      }

      if (this[`${property}Account`] && this[`${property}CostCenter`]) {
        this.filteredTransactionTypeItems = this.transactionTypeItems.filter(
            t => t.bankAccount.id === this[`${property}Account`].id && t.costCenter.id === this[`${property}CostCenter`].id
        );
      }
      else if (this[`${property}Account`]) {
        this.filteredTransactionTypeItems = this.transactionTypeItems.filter(
            t => t.bankAccount.id === this[`${property}Account`].id
        );
      }
      else if (this[`${property}CostCenter`]) {
        this.filteredTransactionTypeItems = this.transactionTypeItems.filter(
            t => t.costCenter.id === this[`${property}CostCenter`].id
        );
      }
      else {
        this.filteredTransactionTypeItems = this.transactionTypeItems;
      }

      this.filteredTransactionTypeItems = this.filteredTransactionTypeItems.map(t => { return {
        id: t.id,
        label: `${t.reference} (${NumberService.getAccountNumber(t.bankAccount.iban)}, ${t.costCenter.name})`,
        }
      });
    },

    onBlurPayerAccount() {
      // this.payerAccounts = copyService.copyArray(this.bankAccounts).map(
      //     p => { return { id: p.id, label: `${p.accountHolderName} (${p.iban})`, external: p.external} });

      if (this.payeeAccount) {
        // this.payerAccounts = this.payeeAccount.external
        //   ? this.payerAccounts.filter(p => p.id !== this.payeeAccount.id && !p.external)
        //   : this.payerAccounts.filter(p => p.id !== this.payeeAccount.id);
      }

      this.v$.payerAccount.$touch();
    },

    onBlurPayeeAccount() {
      // this.payeeAccounts = copyService.copyArray(this.bankAccounts).map(
      //     p => { return { id: p.id, label: `${p.accountHolderName} (${p.iban})`, external: p.external} });

      // if (this.payerAccount) {
      //   this.payeeAccounts = this.payerAccount.external
      //       ? this.payeeAccounts.filter(p => p.id !== this.payerAccount.id && !p.external)
      //       : this.payeeAccounts.filter(p => p.id !== this.payerAccount.id);
      // }
      //
      // if (this.transactionType && this.transactionType.id === 'reserve') {
      //   this.payeeAccounts = this.payeeAccounts.filter(p => !p.external);
      // }

      this.v$.payeeAccount.$touch();

    },

    pickItem(id, property, findIn) {
      this[property] = this[`${findIn || property + 's'}`].find(p => p.id == id);
    },

    // pickPayerAccount(event) {
    //   const clickedItem = event.target.textContent;
    //
    //   if (clickedItem === '+ Neu hinzufügen') {
    //     this.$emit('addExternalParty');
    //   }
    //   else {
    //     //event.target.id is always "suggestion-xy", where xy is the id, so I need the substring from index 11
    //     const id = event.target.id.substring(11);
    //     this.payerAccount = this.payerAccounts.find(p => p.id == id);
    //   }
    // },

    // pickPayerCostCenter(event) {
    //   const id = event.target.id.substring(11);
    //   this.payerCostCenter = this.payerCostCenters.find(p => p.id == id);
    // }

    saveTransaction() {
      this.v$.$touch();

      if (!this.v$.$error) {
        const newTransaction = {
          sourceBankAccountId: this.payerAccount.id,
          targetBankAccountId: this.payeeAccount.id,
          sourceCostCenterId: this.payerCostCenter?.id,
          targetCostCenterId: this.payeeCostCenter?.id,
          dateString: new Date().toISOString(),
          reserveId: this.transactionType.id === 'reserve'
            ? this.transactionTypeItem.id
            : null,
          loanId: this.transactionType.id === 'loan'
              ? this.transactionTypeItem.id
              : null,
          reference: this.reference,
          amount: NumberService.parseFloat(this.amount),
          transactionType: this.transactionType.id,
        };

        TransactionService.create(newTransaction);
      }
    },
  },

  setup() {
    return {
      v$: useVuelidate(),
    };
  },

  validations() {
    const validation = copyService.copyObject(transactionValidation);

    if (this.payerAccount) {
      validation.payerCostCenter.payerCostCenterValidator = payerCostCenterValidator(this.payerAccount);
    }

    return validation;
    //return transactionValidation;
  },
};

</script>