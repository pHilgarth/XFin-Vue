<template>
  <div class="molecule-input-date form-floating">
    <AtomInputDate :id="field" :class="`xfin__form__form-control form-control col-4${hasErrors ? ' has-errors' : ''}`" :value="modelValue" />
    <AtomLabel class="xfin__form__label" :for="field" :text="`${label}${optional ? '' : ' <i>*</i>'}`" />
  </div>
</template>

<script>
import AtomInputDate from '@/components/atoms/AtomInputDate';
import AtomLabel from '@/components/atoms/AtomLabel';

export default {
  components: {
    AtomInputDate,
    AtomLabel,
  },

  props: {
    field:      { type: String, required: true, },
    label:      { type: String },
    optional:   { type: Boolean },
    modelValue: { type: String }
  }
};

</script>
