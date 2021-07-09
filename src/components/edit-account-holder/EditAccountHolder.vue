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
                <div class="xfin-form__group row">
                    <label class="xfin-form__label col-3" for="name">Name:</label>
                    <input id="name" :class="{'xfin-form__control col-4': true, 'has-errors': v$.name.$error}" type="text" :disabled="accountHolderNameDisabled" v-model="name" @blur="v$.name.$touch" @keyup="enforceMaxLength('name', 15)" />
                    <button class="xfin-form__button btn btn-primary" @click.prevent="toggleAccountHolderNameField" v-if="$route.params.id > 0">{{ accountHolderNameDisabled ? '[edit]' : 'X' }}</button>
                    <button class="xfin-form__button btn btn-primary" @click.prevent="saveAccountHolderName" v-if="$route.params.id > 0 && !accountHolderNameDisabled">Speichern</button>
                    <p class="xfin-form__error" v-if="v$.name.$error">Bitte gib einen Namen an!</p>
                </div>
            </div>
            <div class="xfin-form__section" v-if="!this.accountHolder.bankAccounts.length">
                <div class="xfin-form__group row accounts">
                    <label class="xfin-form__label col-3" for="account">Konto:</label>
                    <button class="xfin-form__button btn btn-primary">Konto hinzufügen</button>
                </div>
            </div>
            <div class="xfin-form__section" v-else>
                <div :class="'xfin-form__notices--accounts alert alert-' + alertType" v-if="accountFormNotice">
                    <span class="xfin-form__notices__text">{{accountFormNotice}}</span>
                    <span class="xfin-form__notices__close" @click="closeNotice">&times;</span>
                </div>
                <div class="xfin-form__group row accounts">
                    <label class="xfin-form__label col-3" for="account">Konto:</label>
                    <select class="xfin-form__control xfin-form__select col-4" v-model="selectedAccountIndex" @change="loadAccountData">
                        <option v-for="(account, index) in accountHolder?.bankAccounts" :key="index" :value="index">{{ account.accountNumber }}</option>
                        <option value="-1" class="new-account">&plus; Neues Konto</option>
                    </select>
                </div>
                <div class="xfin-form__group row">
                    <label class="xfin-form__label col-3" for="iban">IBAN:</label>
                    <input id="iban" :class="{'xfin-form__control col-4': true, 'has-errors': v$.iban.$error}" :disabled="accountFormDisabled" type="text" v-model="iban" @blur="v$.iban.$touch" />
                    <p class="xfin-form__error" v-if="v$.iban.$error">Bitte gib eine gültige IBAN an!</p>
                </div>
                <div class="xfin-form__group row">
                    <label class="xfin-form__label col-3" for="bic">BIC:</label>
                    <input id="bic" :class="{'xfin-form__control col-4': true, 'has-errors': v$.bic.$error}" :disabled="accountFormDisabled" type="text" v-model="bic" @blur="v$.bic.$touch" />
                    <p class="xfin-form__error" v-if="v$.bic.$error">Bitte gib einen gültigen BIC an!</p>
                </div>
                <div class="xfin-form__group row">
                    <label class="xfin-form__label col-3" for="bank">Bank:</label>
                    <input id="bank" :class="{'xfin-form__control col-4': true, 'has-errors': v$.bank.$error}" :disabled="accountFormDisabled" type="text" v-model="bank" @blur="v$.bank.$touch" @keyup="enforceMaxLength('bank', 30)" />
                    <p class="xfin-form__error" v-if="v$.bank.$error">Bitte gib eine Bank an!</p>
                </div>
                <div class="xfin-form__group row">
                    <label class="xfin-form__label col-3" for="description">Beschreibung</label>
                    <input id="description" class="xfin-form__control col-4" :disabled="accountFormDisabled" type="text" placeholder="(optional)" v-model="description" @keyup="enforceMaxLength('description', 15)" />
                </div>
                <div class="xfin-form__group row">
                    <label class="xfin-form__label col-3" for="balance">Kontostand</label>
                    <input id="balance" :class="{'xfin-form__control col-4': true, 'has-errors': v$.balance.$error}" :disabled="accountFormDisabled" type="text" v-model="balance" @blur="v$.balance.$touch" />
                    <p class="xfin-form__error" v-if="v$.balance.$error">Bitte gib einen gültigen Konstostand an!</p>
                </div>
                <button class="xfin-form__button btn btn-primary btn-submit-account" @click.prevent="addAccount" v-if="selectedAccountIndex == -1">Konto hinzufügen</button>
                <button class="xfin-form__button btn btn-primary btn-edit-account" v-else @click.prevent="toggleEditAccount">{{accountFormDisabled ? 'Konto bearbeiten' : 'Abbrechen'}}</button>
                <button class="xfin-form__button btn btn-primary btn-update-account" v-if="selectedAccountIndex != -1 && !accountFormDisabled" @click.prevent="updateAccount">Änderungen speichern</button>
            </div>
            <button class="xfin-form__button btn btn-primary btn-submit-form" @click.prevent="saveAccountHolder">Kontoinhaber speichern</button>
        </form>
    </section>
    </div>
</template>

<script>
    import { useVuelidate } from '@vuelidate/core';
    import { required } from '@vuelidate/validators'

    import { AccountHolderService } from '@/services/account-holder-service';
    import { NumberService } from '../../services/number-service.js';

    import { bicValidator, ibanValidator, balanceValidator } from '@/custom-validators/custom-validators';

    export default {
        beforeMount() {
            this.getAccountHolder(true);
        },
        data() {
            return {
                accountHolder: null,
                accountHolderNameDisabled: false,
                accountFormNotice: '',
                alertType: '',
                selectedAccountIndex: 0,
                accountFormDisabled: false,
                loading: true,

                name: '',
                iban: '',
                bic: '',
                bank: '',
                description: '',
                balance: '',
            }
        },

        methods: {
            addAccount() {
                if (this.validateAccountFields()) {
                    this.accountHolder.bankAccounts.push({
                        accountNumber: this.calculateAccountNumber(),
                        iban: this.iban.toUpperCase(),
                        bic: this.bic.toUpperCase(),
                        bank: this.bank,
                        description: this.description,
                        balance: parseFloat(this.balance.replaceAll('.', '').replace(',', '.'))
                    });

                    this.selectedAccountIndex = this.accountHolder.bankAccounts.length - 1;
                    this.accountFormNotice = 'Konto erfolgreich angelegt. Um ein weiteres Konto anzulegen, wähle "+ Neues Konto"';
                    this.alertType = 'success';
                    this.accountFormDisabled = true;
                    this.loadAccountData();
                }
            },

            calculateAccountNumber() {
                return this.iban.substring(12).replace(/^0+/, '');
            },

            closeNotice() {
                this.accountFormNotice = '';
            },

            toggleAccountHolderNameField() {
                this.accountHolderNameDisabled = !this.accountHolderNameDisabled;

                if (this.accountHolderNameDisabled) {
                    this.name = this.accountHolder.name;
                }
            },

            enforceMaxLength(field, length) {
                if (this[field].length > length) {
                    this[field] = this[field].slice(0, length);
                }
            },

            formatCurrency(value) {
                if (value !== "") {
                    return NumberService.formatCurrency(value).slice(0, -2);
                }
            },

            async getAccountHolder(includeAccounts = false) {
                this.accountHolder = await AccountHolderService.getAccountHolder(this.$route.params.id, includeAccounts);console.log(this.accountHolder);

                if (!this.accountHolder) {
                    this.accountHolder = {
                        bankAccounts: []
                    };
                    this.selectedAccountIndex = -1;
                }
                else {
                    this.accountHolderNameDisabled = true;
                    this.name = this.accountHolder.name;
                    this.loadAccountData();
                }

                this.loading = false;
            },

            loadAccountData() {
                if (this.selectedAccountIndex == -1) {
                    this.iban = '';
                    this.bic = '';
                    this.bank = '';
                    this.description = '';
                    this.balance = '';

                    this.v$.$reset();
                    this.accountFormDisabled = false;
                }
                else {
                    this.iban = this.accountHolder.bankAccounts[this.selectedAccountIndex].iban;
                    this.bic = this.accountHolder.bankAccounts[this.selectedAccountIndex].bic;
                    this.bank = this.accountHolder.bankAccounts[this.selectedAccountIndex].bank;
                    this.description = this.accountHolder.bankAccounts[this.selectedAccountIndex].description;
                    this.balance = this.formatCurrency(this.accountHolder.bankAccounts[this.selectedAccountIndex].balance);

                    this.accountFormDisabled = true;
                }
            },

            saveAccountHolder() {
                this.v$.$touch();
                
                if (!this.v$.$errors.length) {
                    alert('were good to go!');
                }
                else {
                    alert('no, we have errors here');
                }
            },

            saveAccountHolderName() {
                this.v$.name.$touch();

                if (!this.v$.name.$errors.length) {
                    this.accountHolder.name = this.name;
                    this.accountHolderNameDisabled = true;
                }
            },

            toggleEditAccount() {
                this.accountFormDisabled = !this.accountFormDisabled;

                if (this.accountFormDisabled) {
                    this.loadAccountData();
                }
            },

            updateAccount() {
                if (this.validateAccountFields()) {
                    let bankAccount = this.accountHolder.bankAccounts[this.selectedAccountIndex];

                    bankAccount.accountNumber = this.calculateAccountNumber();
                    bankAccount.iban = this.iban.toUpperCase();
                    bankAccount.bic = this.bic.toUpperCase();
                    bankAccount.bank = this.bank;
                    bankAccount.description = this.description;
                    bankAccount.balance = parseFloat(this.balance.replaceAll('.', '').replace(',', '.'));

                    this.loadAccountData();
                }
            },

            validateAccountFields() {
                this.v$.iban.$touch();
                this.v$.bic.$touch();
                this.v$.bank.$touch();
                this.v$.balance.$touch();

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
                iban: { required, ibanValidator },
                bic: { required, bicValidator },
                bank: { required },
                balance: { required, balanceValidator }
            }
        }
    }
</script>