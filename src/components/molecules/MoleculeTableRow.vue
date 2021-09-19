<template>
    <tr v-if="atom === 'tableHead'" v-bind="config.props">
        <AtomTableHeader v-for="(field, index) in config.fields" :key="index" :content="field.content" />
    </tr>
    <tr v-else-if="atom === 'tableData'" v-bind="config.props">
        <AtomTableData v-for="(field, index) in config.fields" :key="index" :config="field" />
    </tr>
</template>

<script>
import AtomTableHeader from "@/components/atoms/AtomTableHeader";
import AtomTableData from "@/components/atoms/AtomTableData";


export default {
    components: {
        AtomTableHeader,
        AtomTableData,
    },

    props: {
        config: {
            type: Object,
            required: true
        },
        atom: { required: true }
    },
}
</script>