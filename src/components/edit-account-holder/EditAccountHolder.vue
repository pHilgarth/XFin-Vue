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
                    <input id="name" :class="{'xfin-form__control col-4': true, 'has-errors': v$.name.$error}" type="text" v-model="v$.name.$model" @blur="v$.name.$touch" @keyup="enforceMaxLength('name', 15)" />
                    <p class="xfin-form__error" v-if="v$.name.$error">Bitte gib einen Namen an!</p>
                </div>
            </div>
            <div class="xfin-form__section">
                <p class="xfin-form__notices--accounts">{{accountNotice}}</p>
                <div class="form-group row">
                    <label class="xfin-form__label col-3" for="account">Konto:</label>
                    <select class="xfin-form__control xfin-form__select col-4" v-model="selectedAccountIndex">
                        <option v-for="(account, index) in accountHolder?.bankAccounts" :key="index" :value="index">{{ account.accountNumber }}</option>
                        <option value="-1" class="new-account">&plus; Neues Konto</option>
                    </select>
                </div>
                <div class="form-group row">
                    <label class="xfin-form__label col-3" for="iban">IBAN:</label>
                    <input id="iban" :class="{'xfin-form__control col-4': true, 'has-errors': v$.iban.$error}" type="text" v-model="iban" @blur="v$.iban.$touch" />
                    <p class="xfin-form__error" v-if="v$.iban.$error">Bitte gib eine gültige IBAN an!</p>
                </div>
                <div class="form-group row">
                    <label class="xfin-form__label col-3" for="bic">BIC:</label>
                    <input id="bic" :class="{'xfin-form__control col-4': true, 'has-errors': v$.bic.$error}" type="text" v-model="bic" @blur="v$.bic.$touch" />
                    <p class="xfin-form__error" v-if="v$.bic.$error">Bitte gib einen gültigen BIC an!</p>
                </div>
                <div class="form-group row">
                    <label class="xfin-form__label col-3" for="bank">Bank:</label>
                    <input id="bank" :class="{'xfin-form__control col-4': true, 'has-errors': v$.bank.$error}" type="text" v-model="bank" @blur="v$.bank.$touch" @keyup="enforceMaxLength('bank', 30)" />
                    <p class="xfin-form__error" v-if="v$.bank.$error">Bitte gib eine Bank an!</p>
                </div>
                <div class="form-group row">
                    <label class="xfin-form__label col-3" for="description">Beschreibung</label>
                    <input id="description" class="xfin-form__control col-4" type="text" placeholder="(optional)" v-model="description" @keyup="enforceMaxLength('description', 15)" />
                </div>
                <div class="form-group row">
                    <label class="xfin-form__label col-3" for="balance">Kontostand</label>
                    <input id="balance" :class="{'xfin-form__control col-4': true, 'has-errors': v$.balance.$error}" type="text" v-model="balance" @blur="v$.balance.$touch" />
                    <p class="xfin-form__error" v-if="v$.balance.$error">Bitte gib einen gültigen Konstostand an!</p>
                </div>
                <button class="xfin-form__button btn btn-primary btn-submit-account" @click.prevent="addAccount" >Konto hinzufügen</button>
            </div>
        </form>
    </section>
    </div>
</template>

<script>
    import { useVuelidate } from '@vuelidate/core';
    import { required } from '@vuelidate/validators'

    import { AccountHolderService } from '@/services/account-holder-service';

    import { bicValidator, ibanValidator, balanceValidator } from '@/custom-validators/custom-validators';

    export default {
        beforeMount() {
            this.getAccountHolder(true);
        },
        data() {
            return {
                accountHolder: null,
                accountNotice: '',
                selectedAccountIndex: -1,
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
                        iban: this.iban,
                        bic: this.bic,
                        bank: this.bank
                    });

                    this.selectedAccountIndex = this.accountHolder.bankAccounts.length - 1;
                    this.accountNotice = 'Konto erfolgreich angelegt. Um ein weiteres Konto anzulegen, wähle "+ Neues Konto"';
                }
            },

            calculateAccountNumber() {
                return this.iban.substring(12).replace(/^0+/, '');

            },

            enforceMaxLength(field, length) {
                if (this[field].length > length) {
                    this[field] = this[field].slice(0, length);
                }
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