<template>
  <div class="organism-loan-form">
    <div class="organism-loan-form__inner">
      <AtomHeadline tag="h1" text="Darlehen erstellen" />
      <form>
        <MoleculeInputSelect class="pb-5" field="accountRole" v-model="accountRole" label="Rolle dieses Accounts"
                             :options="accountRoleOptions" />
{{ accountRole }}
        <MoleculeInputAutoSuggest v-if="accountRole !== 'choose'" field="counter-party" v-model="counterParty"
                                  :label="accountRole === 'creditor' ? 'Schuldner' : 'Gläubiger'"
                                  :items="counterParties.map(e => e.name)" @itemPicked="pickCounterParty" />

        <MoleculeInputSelect v-if="accountRole === 'debitor'" class="pb-5" field="costCenter" v-model="costCenterId" label="Kostenstelle"
                             :options="[{ value: -1, label: '(bitte wählen)' }, ...costCenters.map(c => { return { value: c.id, label: c.name } })]" />

        {{ costCenterId }}
        <MoleculeInputText class="pb-5" field="reference" label="Verwendungszweck" />
        <MoleculeInputText class="pb-5" field="amount" label="Betrag" />
        <MoleculeInputText class="pb-5" field="life" label="Laufzeit" />
        <MoleculeInputText class="pb-5" field="rate-of-interest" label="Zinssatz" />
        <MoleculeInputText class="pb-5" field="monthly-installment" label="Monatsrate" />

      </form>
    </div>
  </div>
</template>

<script>
//import AtomButton from '@/components/atoms/AtomButton';
import AtomHeadline from '@/components/atoms/AtomHeadline';
//import AtomParagraph from '@/components/atoms/AtomParagraph';
import MoleculeInputAutoSuggest from '@/components/molecules/MoleculeInputAutoSuggest';
import MoleculeInputSelect from '@/components/molecules/MoleculeInputSelect';
import MoleculeInputText from '@/components/molecules/MoleculeInputText';

export default {
  components: {
    //AtomButton,
    AtomHeadline,
    //AtomParagraph,
    MoleculeInputAutoSuggest,
    MoleculeInputSelect,
    MoleculeInputText,
  },

  props: {
    costCenters: { type: Array, required: true },
    counterParties: { type: Array, required: true },
  },

  data() {
    return {
      //accountRole: 'choose',
      accountRole: 'choose',
      costCenterId: this.costCenters[0].id,
      counterParty: null,

      accountRoleOptions: [
        { value: 'choose', label: '(bitte wählen)', disabled: true },
        { value: 'creditor', label: 'Gläubiger' },
        { value: 'debitor', label: 'Schuldner' },
      ],
    };
  },

  methods: {
    pickCounterParty() {
      console.log('ok');
    }
  }

}
</script>