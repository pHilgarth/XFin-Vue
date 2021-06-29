<template>
    <p style="position: absolute;margin-top:-30px;font-size:14px;">data in component: {{ accountHolder || 'NULL' }}</p>
    <div class="edit-account-holder">
    <section class="loading" v-if="loading">
      <div>Daten werden geladen ...</div>
    </section>
    <section class="loading-error" v-else-if="$route.params.id > 0 && !accountHolder">
      <div class="fetching-error">Fehler beim Laden der Kontoinhaber!</div>
    </section>
    <section class="edit-account-holder-body" v-else>
        <h1>{{ (Number)($route.params.id) > 0 ? "Kontoinhaber bearbeiten" : "Kontoinhaber hinzufügen" }}</h1>
        <form class="xfin-form">
            <div class="xfin-form__section">
                <div class="form-group row">
                    <label class="xfin-form__label col-3" for="name">Name:</label>
                    <input id="name" :class="{'xfin-form__control col-4': true, 'has-errors': v$.name.$error}" type="text" v-model="v$.name.$model" @blur="v$.name.$touch" />
                    <p class="xfin-form__error" v-if="v$.name.$error">Bitte gib einen Namen an!</p>
                </div>
            </div>
            <div class="xfin-form__section">
                <div class="form-group row">
                    <label class="xfin-form__label col-3" for="account">Konto:</label>
                    <select class="xfin-form__control xfin-form__select col-4" v-model="selectedAccountIndex">
                        <option v-for="(account, index) in accountHolder?.bankAccounts" :key="index" :value="index">{{ account.accountNumber }}</option>
                        <option value="-1" class="new-account">&plus; Neues Konto</option>
                    </select>
                </div>
                <div class="form-group row">
                    <label class="xfin-form__label col-3" for="name">IBAN:</label>
                    <input id="name" class="xfin-form__control col-4" type="text" v-model="iban" @blur="v$.iban.$touch" />
                    <p class="xfin-form__error" v-if="v$.iban.$error">Bitte gib eine gültige IBAN an!</p>
                </div>
                <div class="form-group row">
                    <label class="xfin-form__label col-3" for="name">BIC:</label>
                    <input id="name" class="xfin-form__control col-4" type="text" v-model="bic" @blur="v$.bic.$touch" />
                    <p class="xfin-form__error" v-if="v$.bic.$error">Bitte gib einen gültigen BIC an!</p>
                </div>
                <div class="form-group row">
                    <label class="xfin-form__label col-3" for="name">Bank:</label>
                    <input id="name" class="xfin-form__control col-4" type="text" v-model="bank" @blur="v$.bank.$touch" />
                    <p class="xfin-form__error" v-if="v$.bank.$error">Bitte gib eine Bank an!</p>
                </div>
                <div class="form-group row">
                    <label class="xfin-form__label col-3" for="name">Beschreibung</label>
                    <input id="name" class="xfin-form__control col-4" type="text" placeholder="(optional)" v-model="description" />
                </div>
                <button class="xfin-button btn btn-primary" @click.prevent="addAccount" >Konto hinzufügen</button>
            </div>
        </form>
    </section>
    </div>
</template>

<script>
    import { useVuelidate } from '@vuelidate/core';
    import { required } from '@vuelidate/validators'

    import { AccountHolderService } from '@/services/account-holder-service';

    export default {
        beforeMount() {
            this.getAccountHolder(true);
        },
        data() {
            return {
                accountHolder: null,
                selectedAccountIndex: -1,
                loading: true,

                name: '',
                iban: '',
                bic: '',
                bank: '',
                description: '',
            }
        },

        methods: {
            addAccount() {
                if (this.validateAccountFields()) {
                    this.accountHolder.bankAccounts.push({
                        accountNumber: this.calculateAccountNumber(),
                        iban: this.iban,
                        bic: this.bic,
                        bank: this.bank
                    });

                    this.selectedAccountIndex = this.accountHolder.bankAccounts.length - 1;
                }
            },

            calculateAccountNumber() {
                return this.iban.substring(12).replace(/^0+/, '');

            },

            async getAccountHolder(includeAccounts = false) {
                this.accountHolder = await AccountHolderService.getAccountHolder(this.$route.params.id, includeAccounts);console.log(this.accountHolder);

                if (!this.accountHolder) {
                    this.accountHolder = {
                        bankAccounts: []
                    };
                }

                this.loading = false;
            },

            validateAccountFields() {
                this.v$.iban.$touch();
                this.v$.bic.$touch();
                this.v$.bank.$touch();

                if (!this.v$.$errors.length) {
                    return true;
                }
            }
        },
        setup() {
            return {
                v$: useVuelidate(),
            }
        },

        validations() {
            return {
                name: { required },
                iban: { required },
                bic: { required },
                bank: { required },
            }
        }
    }
</script>