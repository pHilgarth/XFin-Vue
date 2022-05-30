<template>
  <div>
    <select v-model="firstSelect" @update:modelValue="v$.firstSelect.$touch()" @blur="v$.firstSelect.$touch()" :class="{ error: firstSelectHasErrors }">
      <option></option>
      <option value="A">A</option>
      <option value="B">B</option>
      <option value="C">C</option>
    </select>
    <p v-if="firstSelectHasErrors" style="color: red">This option is invalid.</p>
    <br />
    <br />
    <select v-model="secondSelect" @update:modelValue="v$.secondSelect.$touch()" @blur="v$.secondSelect.$touch()" :class="{ error: secondSelectHasErrors }">
      <option></option>
      <option value="1">1</option>
      <option value="2">2</option>
      <option value="3">3</option>
    </select>
    <p v-if="secondSelectHasErrors" style="color: red">This option is invalid.</p>
    <hr />
  </div>
</template>

<style>
select { width: 250px }
.error {
  border: 3px solid red;
}
</style>
<script>
import useVuelidate from "@vuelidate/core";

import { firstSelectValidator, secondSelectValidator } from "@/validation/custom-validators";

export default {

  computed: {
    firstSelectHasErrors() { return this.v$.firstSelect.$error },
    secondSelectHasErrors() { return this.v$.secondSelect.$error },
  },

  data() {
    return {
      firstSelect: '',
      secondSelect: '',
    };
  },

  setup() {
    return {
      v$: useVuelidate(),
    };
  },

  validations() {
    return {
      firstSelect: { firstSelectValidation: firstSelectValidator(this.secondSelect) },
      secondSelect: { secondSelectValidation: secondSelectValidator(this.firstSelect) },
    };
  },
};
</script>