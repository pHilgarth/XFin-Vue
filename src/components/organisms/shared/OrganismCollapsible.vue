<!-- TODO - this component is using the v-html directive - make sure it always gets trusted content! -->
<template>
  <div class="organism-collapsible" :class="{ 'collapsed': collapsed }">
    <MoleculeCollapsibleHeader :title="title" @state-switched="collapsed = !collapsed" />
    <MoleculeCollapsibleBody :collapsed="collapsed">
      <template v-for="(content, index) in config.content" :key="index">
        <div v-if="content.content" v-html="content.content" v-bind="content.props"></div>
        <template v-else-if="content.component" v-bind="content.props">
          <component :is="content.component.tag" v-bind="content.component.props" />
        </template> 
      </template>
    </MoleculeCollapsibleBody>
  </div>
</template>

<script>
/* COMPONENT DOCS
  Props:
    config: {
      collapsed:  <boolean>,    --> defines the default state of the Collapsible
      title:      <string>,     --> defines the visible headline in the top bar of the Collapsible (visible when collapsed and expanded)
      content: [
        {
          content: <string> || component: <object>,   --> either a simple string (optional with html) or an object to render a component
                                                      --> see next sample object for the required component properties
          props: <object>,                            --> every attribute to bind to along with the desired value (i.e. class: amount < 0 ? 'negative' : '')
        },
        {
          component: {
            tag: <string>                             --> has to match a globally registered component name (see main.js for all globally registered components)
            props: <object>                           --> the props expected by the given component
          }
        }
      ]
    };
*/

import MoleculeCollapsibleHeader from "@/components/molecules/MoleculeCollapsibleHeader";
import MoleculeCollapsibleBody from "@/components/molecules/MoleculeCollapsibleBody";

export default {
  components: {
    MoleculeCollapsibleHeader,
    MoleculeCollapsibleBody,
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
