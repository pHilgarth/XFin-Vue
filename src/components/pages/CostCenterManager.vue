<template>
  <div class="cost-center-manager">
    <AtomHeadline tag="h1" text="Kostenstellen" />

    <MoleculeLoading v-if="!dataLoaded" :loadingError="loadingError" errorMessage="Fehler beim Laden der Kostenstellen!"/>

    <template v-else>

      <MoleculeCostCenterRow v-for="costCenter in costCenters" :key="costCenter.id" :costCenter="costCenter" :allowEdit="!createNew" @edit-cost-center="editCostCenter = true"
                             @cancel-edit="editCostCenter = false" @update-cost-center="updateCostCenter"/>

      <MoleculeInputText v-if="createNew" class="pb-4" field="cost-center" v-model="newCostCenter" :validation="v$.newCostCenter"
                         :hasErrors="v$.newCostCenter.$error" @blur="v$.newCostCenter.$touch()" label="Neue Kostenstelle" />

      <AtomButton class="me-3" v-if="createNew" type="primary" text="Speichern" :disabled="v$.newCostCenter.$error" @click="saveCostCenter" />
      <AtomButton class="me-3" v-if="createNew" type="cancel" text="Abbrechen" @click="cancelCostCenterCreation"/>
      <template v-if="duplicatedName">
        <AtomSpan class="xfin__form__error" text="Dieser Name wird bereits verwendet!"/>
      </template>

      <AtomButton v-if="!createNew" type="primary" text="Kostenstelle hinzufügen" @click="createNew = true" :disabled="editCostCenter"/>

    </template>
  </div>
</template>

<script>
import { useVuelidate } from "@vuelidate/core";
import { required } from "@vuelidate/validators";

import AtomButton from '@/components/atoms/AtomButton';
import AtomHeadline from '@/components/atoms/AtomHeadline';
import AtomSpan from '@/components/atoms/AtomSpan';

import MoleculeInputText from "@/components/molecules/MoleculeInputText";
import MoleculeLoading from '@/components/molecules/MoleculeLoading';
import MoleculeCostCenterRow from "@/components/molecules/MoleculeCostCenterRow";

import { costCenterService } from "@//services/cost-center-service";

export default {
  components: {
    AtomButton,
    AtomHeadline,
    AtomSpan,
    MoleculeInputText,
    MoleculeLoading,
    MoleculeCostCenterRow
  },

  async created() {
    try {
      if (this.$cookies.get('user')) {
        this.user = this.$cookies.get('user');
      }

      await this.getCostCenters()

      this.dataLoaded = true;
    }
    catch (error) {
      console.error(error);
      this.loadingError = true;
    }
  },

  watch: {
    newCostCenter() {
      if (this.createNew) {
        this.v$.newCostCenter.$touch();
      }

      this.duplicatedName = false;
    },
  },

  data() {
    return {
      costCenters: null,
      createNew: false,
      dataLoaded: false,
      duplicatedName: false,
      editCostCenter: false,
      loadingError: false,
      newCostCenter: null,
      user: null,
    }
  },

  methods: {
    cancelCostCenterCreation() {
      this.createNew = false;
      this.newCostCenter = '';
      this.duplicatedName = false;
      this.v$.$reset();
    },

    async getCostCenters() {
      try {
        this.costCenters = await costCenterService.getAllByUser(this.user.id);
      }
      catch (error) {
        console.error(error);
        throw new Error(error);
      }
    },

    async saveCostCenter() {
      try {
        const duplicatedCostCenter = await costCenterService.getSingleByUserAndName(this.user.id, this.newCostCenter);

        if (!duplicatedCostCenter) {
          await costCenterService.create({ name: this.newCostCenter, userId: this.user.id });
          await this.getCostCenters();

          this.cancelCostCenterCreation();
        }
        else {
          this.duplicatedName = true;
        }
      }
      catch (error) {
        console.error(error);
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