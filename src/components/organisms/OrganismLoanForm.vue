<template>
  <div class="organism-loan-">
    <div class="organism-loan-form__inner">
      <AtomHeadline tag="h1" text="Darlehen erstellen" />
      <form>
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
import MoleculeInputText from '@/components/molecules/MoleculeInputText';

export default {
  components: {
    //AtomButton,
    AtomHeadline,
    //AtomParagraph,
    MoleculeInputText,
  }
}
</script>