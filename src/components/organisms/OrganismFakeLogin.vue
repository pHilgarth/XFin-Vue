<template>
  <div class="fake-login">
    <AtomHeadline tag="h1" text="Fake-Login" />
    <p style="font-size:10px">differenzierte Fehlermeldungen einbauen! Es kommt immer "Falsche Login-Daten" - auch wenn der Server grad einfach down ist</p>
    <MoleculeNotice v-if="loginError" type="danger" :text="loginErrorMessage" />
    <form>
      <MoleculeInputText  class="xfin__login__email pb-5" field="email" label="E-Mail" type="email" autocomplete="username" v-model="userMail"
                          :hasErrors="v$.userMail.$error" :validation="v$.userMail" @blur="v$.userMail.$touch()" />
      <MoleculeInputText  class="xfin__login__password pb-5" field="password" label="Passwort" type="password" autocomplete="current-password" v-model="userPassword"
                          :hasErrors="v$.userPassword.$error" :validation="v$.userPassword" @blur="v$.userPassword.$touch()" />
      <AtomButton type="primary" text="Login" :disabled="v$.$silentErrors.length" @click.prevent="login"/>
    </form>
  </div>
</template>

<script>
import AtomButton from '@/components/atoms/AtomButton';
import AtomHeadline from '@/components/atoms/AtomHeadline';
import MoleculeInputText from '@/components/molecules/MoleculeInputText';
import MoleculeNotice from '@/components/molecules/MoleculeNotice';

import { userService } from '@/services/user-service';

import { useVuelidate } from "@vuelidate/core";
import { userValidation } from '@/validation/validations';

export default {
  emits: [ 'login' ],

  data() {
    return {
      user: null,
      userId: '',
      userMail: '',
      userPassword: '',
      loginError: false,
      loginErrorMessage: null,
    };
  },

  components: {
    AtomButton,
    AtomHeadline,
    MoleculeInputText,
    MoleculeNotice,
  },

  methods: {
    async login() {
      this.loginError = false;
      try {
        const user = await userService.get({
          email: this.userMail,
          password: this.userPassword,
        });

        if (!user) {
          this.loginErrorMessage = 'Falsche Login-Daten!';
          this.loginError = true;
        }
        else {
          this.$emit('login', user)
        }
      }
      catch (error) {
        console.error(error);
        this.loginErrorMessage = 'Fehler beim Prüfen der Login-Daten!';
        this.loginError = true;
      }
    }
  },

  setup() {
    return { v$: useVuelidate() };
  },

  validations() {
    return userValidation;
    },

};
</script>