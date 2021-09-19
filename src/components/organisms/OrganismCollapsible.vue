<template>
  <div class="xfin-card" :class="{ 'collapsed': collapsed }">
    <MoleculeCollapsibleHeader :title="title" @state-switched="collapsed = !collapsed" />
    <MoleculeCollapsibleBody :collapsed="collapsed">
      <component :is="config.content.component" v-bind="config.content.props" />
    </MoleculeCollapsibleBody>

  </div>
</template>

<script>
/* COMPONENT DOCS
  Props:
    config: {
      collapsed:  <boolean>,    --> defines the default state of the Collapsible
      title:      <string>,     --> defines the visible headline in the top bar of the Collapsible (visible when collapsed and expanded)
      content: {
          component: <string>,  --> this has to match a globally registered component (see main.js for all globally registered components)
          props: <object>,      --> if the component referenced in 'component' expects props, define them as properties of the 'props' object
        },
    };
*/

import MoleculeCollapsibleHeader from "@/components/molecules/MoleculeCollapsibleHeader";
import MoleculeCollapsibleBody from "@/components/molecules/MoleculeCollapsibleBody";

export default {
  components: {
    MoleculeCollapsibleHeader,
    MoleculeCollapsibleBody,
  },

  computed: {
    cardHeaderClassList() {
      return this.cardExpanded ? " expanded" : "";
    }
  },

  data() {
    return {
      collapsed: this.config.collapsed,
      title: this.config.title,
    }
  },

  props: {
    config: {
      type: Object,
      required: true
    }
  },
};
</script>
