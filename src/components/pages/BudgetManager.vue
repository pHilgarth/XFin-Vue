<template>
    <section>
        <h1>Budgetmanager</h1>
        <span class="dev-hint important">
            verfügbarer Betrag einer KS muss auch geplante Ausgaben berücksichtigen! Geld für geplante Ausgaben kann nicht umgebucht werden <b>TODO</b><br />
            bei offenen Änderungen wär es cool, wenn der Collapsible Header irgendwie hervorgehen würde, allerdings müsste ich die Info irgendwie ans parent übergeben (OrgansimCollapsible)
        </span>
        <MoleculeLoading v-if="loading || !accountHolders" :loadingError="!loading && !accountHolders" />
        <div v-else>
            <form class="xfin-form">
                <div class="xfin-form__section">
                    <div class="xfin-form__group row">
                        <label class="xfin-form__label col-4" for="accountHolder">Budget verwalten für:</label>
                        <select class="xfin-form__control xfin-form__select col-4" v-model="selectedAccountHolderIndex" @change="changeAccountHolder">
                            <option class="placeholder-option" hidden value="-1">(Kontoinhaber wählen)</option>
                            <option v-for="(accountHolder, index) in accountHolders" :key="index" :value="0">
                                {{ accountHolder.name }}
                            </option>
                        </select>
                    </div>
                </div>
            </form>
            <template v-if="selectedAccountHolder">
                <template v-for="(bankAccount, index) in selectedAccountHolder.bankAccounts" :key="index">
                    <OrganismCollapsible :config="configureCollapsible(bankAccount)" />
                </template>
            </template>
        </div>
    </section>
</template>

<script>
import MoleculeLoading from "@/components/molecules/MoleculeLoading";
import OrganismCollapsible from "@/components/organisms/OrganismCollapsible";

import { AccountHolderService } from "@/services/account-holder-service";
import { NumberService } from "@/services/number-service";
import { TransactionCategoryService } from '@/services/transaction-category-service.js';

export default {
    beforeMount() {
        this.getAccountHolders();
    },

    components: {
        MoleculeLoading,
        OrganismCollapsible,
    },

    data() {
        return {
            accountHolders: [],
            loading: true,

            selectedAccountHolder: null,
            selectedAccountHolderIndex: -1,

            test: [],
        }
    },

    methods: {
        async changeAccountHolder() {
            const accountHolder = this.accountHolders[this.selectedAccountHolderIndex];
            //this.selectedAccountHolder = this.accountHolders[this.selectedAccountHolderIndex];

            const year = new Date().getFullYear();
            const month = new Date().getMonth();

            for (let i = 0; i < accountHolder.bankAccounts.length; i++) {
                let bankAccount = accountHolder.bankAccounts[i]
                bankAccount.transactionCategories = await TransactionCategoryService.getTransactionCategoriesByAccount(bankAccount.id, year, month);

                bankAccount.transactionCategories.forEach(category => {
                    category.balance = NumberService.formatCurrency(category.balance, false);
                    category.bankAccountId = bankAccount.id;
                });
            }

            this.selectedAccountHolder = accountHolder;
        },

        configureCollapsible(bankAccount) {
            return {
                collapsed: true,
                title: bankAccount.accountNumber,
                content: [{
                    component: {
                        tag: 'OrganismBudgetList',
                        props: {
                            transactionCategories: bankAccount.transactionCategories,
                        },
                    },
                }],
            };
        },

        async getAccountHolders() {
            const includeAccounts = true;
            this.accountHolders = await AccountHolderService.getAccountHolders(includeAccounts);
            this.loading = false;
        },

        async getTransactionCategories() {

        }
    }
};
</script>