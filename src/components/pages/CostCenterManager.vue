<template>
  <div class="xfin__cost-center-manager">
    <h1>Kostenstellenverwaltung</h1>

    <MoleculeLoading v-if="!dataLoaded" :loadingError="loadingError" errorMessage="Fehler beim Laden der Kostenstellen!"/>

    <template v-else>
      <AtomButton v-if="!createNew" type="primary" text="Kostenstelle hinzufügen" @click="createNew = true" :disabled="editCostCenter"/>
      <AtomButton class="me-3" v-if="createNew" type="primary" text="Speichern" @click="saveCostCenter" />
      <AtomButton v-if="createNew" type="cancel" text="Abbrechen" @click="cancelCostCenterCreation"/>

      <div class="xfin__cost-centers" >
        <MoleculeInputText v-if="createNew" classList="pb-4" field="cost-center" :hasErrors="nameErrors" v-model="newCostCenter" @blur="v$.newCostCenter.$touch()" :validation="v$.newCostCenter"
                           label="Neue Kostenstelle" />
        
        <MoleculeCostCenterRow v-for="costCenter in costCenters" :key="costCenter.id" :costCenter="costCenter" :allowEdit="!createNew" @edit-cost-center="editCostCenter = true"
                               @cancel-edit="editCostCenter = false" @update-cost-center="updateCostCenter"/>
      </div>
    </template>

  </div>
</template>

<script>
import { useVuelidate } from "@vuelidate/core";
import { required } from "@vuelidate/validators";

import AtomButton from "@/components/atoms/AtomButton";

import MoleculeInputText from "@/components/molecules/MoleculeInputText";
import MoleculeLoading from "@/components/molecules/MoleculeLoading";
import MoleculeCostCenterRow from "@/components/molecules/MoleculeCostCenterRow";

import { CostCenterService } from "@//services/cost-center-service";

export default {
  components: {
    AtomButton,
    MoleculeInputText,
    MoleculeLoading,
    MoleculeCostCenterRow
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

  async created() {
    let apiResponse = await this.getCostCenters();

    if (apiResponse.success) {
      this.dataLoaded = true;
    } else {
      this.loadingError = true;
      console.error(apiResponse.error);
    }
  },

  methods: {
    cancelCostCenterCreation() {
      this.createNew = false;
      this.newCostCenter = '';
      this.v$.$reset();
    },

    async getCostCenters() {
      const apiResponse = await CostCenterService.getAll();

      if (apiResponse.success && apiResponse.data) {
        apiResponse.data.splice(apiResponse.data.findIndex(t => t.name === 'Nicht zugewiesen'), 1);

        this.costCenters = apiResponse.data;
      }
      else if (apiResponse.success && !apiResponse.data) {
        this.costCenters = [];
      }

      return apiResponse;
    },

    async saveCostCenter() {
      this.v$.$touch();

      if (!this.nameErrors) {
        await CostCenterService.create({ name: this.newCostCenter });
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