<template>
    <div class="xfin-modal" style="background-color:white">
        <h4 class="dev-hint">
            verfügbarer Betrag von Konstenstellen muss noch korrekt berechnet werden, evtl. neuer API Endpoint -
            von dem Betrag müssen noch die Fixkosten abgezogen werden, damit wirklich nur der Betrag dransteht, der verfügbar ist -
            wenn ich z. B. auf Auto 120 € habe und davon 60 € auf jeden Fall weggehen für Schulden oder so, habe ich diese 60 € nicht zur Verfügung.
        </h4>
      <form class="xfin-form">
        <div class="xfin-form__section">
          <div class="xfin-form__group row">
            <label class="xfin-form__label col-3" for="account">Konto:</label>
            <label v-if="bankAccountOptions.length === 2">{{ bankAccountOptions[1] }}</label>
            <select class="xfin-form__control xfin-form__select col-4" v-model="selectedAccountIndex" @change="changeAccount">
              <option v-for="(option, index) in bankAccountOptions" :key="index" :value="index" :disabled="!parseInt(option.label)">
                {{ parseInt(option.label) ? `&nbsp;&nbsp;${option.label}` : option.label }}
              </option>
            </select>
          </div>
        </div> 
        <div class="xfin-form__section">
            <div v-for="category in categories" :key="category.name">{{ category.name }} - {{ formatCurrency(category.balance) }}</div>
        </div>
      </form>
    <button @click.prevent="closeModal">close</button>
    </div>
</template>

<script>
import { NumberService } from '@/services/number-service';
import { TransactionCategoryService } from '@/services/transaction-category-service.js';

export default {
    beforeMount() {
        this.getCategoriesByAccount(this.bankAccountOptions[1].id);
    },

    data() {
        return {
            categories: null,
            selectedAccountIndex: 1,
        }
    },

    methods: {
        closeModal() {
            this.$emit('closed');
        },

        formatCurrency(value) {
          return NumberService.formatCurrency(value);
        },

        async getCategoriesByAccount(id) {
            const year = new Date().getFullYear();
            const month = new Date().getMonth();

            this.categories = await TransactionCategoryService.getTransactionCategoriesByAccount(id, year, month);
        }
    },

    props: {
        bankAccountOptions: {
            type: Array,
            required: true,
        },
    },
}
</script>