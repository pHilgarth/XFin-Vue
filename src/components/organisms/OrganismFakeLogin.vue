<template>
  <div class="fake-login">
    <AtomHeadline tag="h1" text="Fake-Login" />
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

import { useVuelidate } from "@vuelidate/core";
import { userValidation } from '@/validation/validations';

export default {
  emits: [ 'login' ],

  data() {
    return {
      user: null,
      userMail: '',
      userPassword: '',
    };
  },

  components: {
    AtomButton,
    AtomHeadline,
    MoleculeInputText,
  },

  methods: {
    login() {
      this.$emit('login', { userMail: this.userMail, userPassword: this.userPassword })
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