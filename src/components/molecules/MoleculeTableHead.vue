<template>
    <thead class="molecule-table-head">
        <MoleculeTableRow :config="config" atom="tableHead"/>
    </thead>
</template>

<script>
import MoleculeTableRow from "@/components/molecules/shared/MoleculeTableRow";

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