<template>
  <div class="xfin__cost-center" v-show="!edit">
    <p>{{ costCenter.name }}</p>
    <AtomEditIcon v-if="allowEdit" :id="costCenter.id.toString()" align="right" @click="editCostCenter" />
  </div>
  <div v-if="edit" class="xfin__cost-center--edit">
    <MoleculeInputText classList="mb-4" field="cost-center" :hasErrors="costCenterNameErrors" v-model="costCenterName" @blur="v$.costCenterName.$touch()" :validation="v$.costCenterName"
                       label="Kostenstelle" />
    <div class="xfin__cost-center__buttons">
      <AtomButton type="primary-small" text="&check;" @click="updateCostCenter" :disabled="costCenterNameErrors" />
      <AtomButton type="cancel-small" text="&times;" @click="cancelEdit" />
    </div>
  </div>
</template>

<script>
import { useVuelidate } from "@vuelidate/core";
import { required } from "@vuelidate/validators";

import AtomButton from '@/components/atoms/AtomButton';
import AtomEditIcon from '@/components/atoms/AtomEditIcon';
import MoleculeInputText from '@/components/molecules/MoleculeInputText';

import { CostCenterService } from '@/services/cost-center-service';

  export default {
    emits: [
        'edit-cost-center',
        'cancel-emit',
        'update-cost-center',
    ],

    props: {
      allowEdit:  { type: Boolean, default: true },
      costCenter: { type: Object, required: true },
    },

    components: {
      AtomButton,
      AtomEditIcon,
      MoleculeInputText
    },

    data() {
      return {
        edit: false,
        costCenterName: this.costCenter.name,
      };
    },

    computed: {
      costCenterNameErrors() {
        return this.v$.costCenterName.$error;
      },
    },

    watch: {
      costCenterName() {
        this.v$.costCenterName.$touch();
      }
    },

    methods: {
      cancelEdit() {
        this.edit = false;
        this.costCenterName = this.costCenter.name;
        this.$emit('cancel-edit');
      },

      editCostCenter() {
        this.edit = true;
        this.$emit('edit-cost-center');
      },

      async updateCostCenter() {
        if (this.costCenterName !== this.costCenter.name) {
          const costCenterPatch = {
            op: "replace",
            path: `/name`,
            value: this.costCenterName,
          };
          const updateResponse = await CostCenterService.update(this.costCenter.id, [costCenterPatch]);

          if (!updateResponse.success) {
            alert(updateResponse.error);
          }
          else {
            this.edit = false;
            this.$emit('update-cost-center');
          }
        }
      }
    },

    setup() {
      return { v$: useVuelidate() };
    },

    validations() {
      return {
        costCenterName: { required },
      };
    },
  }
</script>