<template>
  <div class="cost-center-manager">
    <AtomHeadline tag="h1" text="Kostenstellen" />

    <MoleculeLoading v-if="!dataLoaded" :loadingError="loadingError" errorMessage="Fehler beim Laden der Kostenstellen!"/>

    <template v-else>


      <MoleculeCostCenterRow v-for="costCenter in costCenters" :key="costCenter.id" :costCenter="costCenter" :allowEdit="!createNew" @edit-cost-center="editCostCenter = true"
                             @cancel-edit="editCostCenter = false" @update-cost-center="updateCostCenter"/>

      <MoleculeInputText v-if="createNew" class="pb-4" field="cost-center" :hasErrors="nameErrors" v-model="newCostCenter" @blur="v$.newCostCenter.$touch()" :validation="v$.newCostCenter"
                         label="Neue Kostenstelle" />

      <AtomButton class="me-3" v-if="createNew" type="primary" text="Speichern" @click="saveCostCenter" />
      <AtomButton v-if="createNew" type="cancel" text="Abbrechen" @click="cancelCostCenterCreation"/>

      <AtomButton v-if="!createNew" type="primary" text="Kostenstelle hinzufügen" @click="createNew = true" :disabled="editCostCenter"/>

    </template>
  </div>
</template>

<script>
import { useVuelidate } from "@vuelidate/core";
import { required } from "@vuelidate/validators";

import AtomButton from '@/components/atoms/AtomButton';
import AtomHeadline from '@/components/atoms/AtomHeadline';

import MoleculeInputText from "@/components/molecules/MoleculeInputText";
import MoleculeLoading from '@/components/molecules/MoleculeLoading';
import MoleculeCostCenterRow from "@/components/molecules/MoleculeCostCenterRow";

import { costCenterService } from "@//services/cost-center-service";

export default {
  components: {
    AtomButton,
    AtomHeadline,
    MoleculeInputText,
    MoleculeLoading,
    MoleculeCostCenterRow
  },

  async created() {
    try {
      await this.getCostCenters()

      this.dataLoaded = true;
    }
    catch (error) {
      console.error(error);
      this.loadingError = true;
    }
  },

  computed: {
    nameErrors() {
      return this.v$.newCostCenter.$error;
    }
  },

  watch: {
    newCostCenter() {
      if (this.createNew) {
        this.v$.newCostCenter.$touch();
      }
    },
  },

  data() {
    return {
      costCenters: null,
      createNew: false,
      dataLoaded: false,
      editCostCenter: false,
      loadingError: false,
      newCostCenter: null,
    }
  },

  methods: {
    cancelCostCenterCreation() {
      this.createNew = false;
      this.newCostCenter = '';
      this.v$.$reset();
    },

    async getCostCenters() {
      try {
        this.costCenters = await costCenterService.getAll();
        this.costCenters.splice(this.costCenters.findIndex(t => t.name === 'Nicht zugewiesen'), 1);
      }
      catch (error) {
        console.error(error);
        throw new Error(error);
      }
    },

    async saveCostCenter() {
      this.v$.$touch();

      if (!this.nameErrors) {
        await costCenterService.create({ name: this.newCostCenter });
        await this.getCostCenters();

        this.cancelCostCenterCreation();
      }
    },

    updateCostCenter() {
      this.editCostCenter = false;
      this.getCostCenters();
    }
  },

  setup() {
    return { v$: useVuelidate() };
  },

  validations() {
    return {
      newCostCenter: { required },
    };
  },
}

</script>