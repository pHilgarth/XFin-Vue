<template>
    <tbody class="molecule-table-body">
        <MoleculeTableRow v-for="(row, index) in config.rows" :key="index" :config="row" atom="tableData"/>
    </tbody>
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