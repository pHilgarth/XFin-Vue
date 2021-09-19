<template>
    <thead>
        <MoleculeTableRow :config="config" atom="tableHead"/>
    </thead>
</template>

<script>
/* COMPONENT DOCS
  Props:
    config: {
      fields: [
        
      ]
    }
*/
import MoleculeTableRow from "@/components/molecules/MoleculeTableRow";

export default {
    components: {
        MoleculeTableRow,
    },

    props: {
        config: {
            type: Object,
            required: true,
        },
    },
}
</script>