<!-- TODO - this component is using the v-html directive - make sure it always gets trusted content! -->
<template>
  <div class="organism-collapsible" :class="{ 'collapsed': collapsed }">
    <MoleculeCollapsibleHeader :title="title" @state-switched="collapsed = !collapsed" />
    <div :class="`organism-collapsible__body${ collapsed ? ' collapsed' : ''}`">
      <slot></slot>
    </div>
  </div>
</template>

<script>
import MoleculeCollapsibleHeader from "@/components/molecules/MoleculeCollapsibleHeader";

export default {
  components: {
    MoleculeCollapsibleHeader,
  },

  props: {
    title: { type: String, required: true }
  },

  data() {
    return {
      collapsed: true,
    }
  }
};

</script>