<template>
  <span class="dev-hint">right now it's not possible to pass attribute values to a &lt;td&gt; element, like class or id - see MoleculeTableRow for reference how to do this</span>
  <table>
    <MoleculeTableHead v-if="config.tableHead" :config="config.tableHead" />
    <MoleculeTableBody v-if="config.tableBody" :config="config.tableBody" />
  </table>
</template>

<script>
/* COMPONENT DOCS
  Props:
    config: {
      tableHead: {
        fields: [
          { content: <string> },      --> the value of 'content' becomes the text in the <th> element
          { content: <string> },
          { content: <string> },
          ...
        ]
      },
      tableBody: {
        rows: [
          {                                                     --> every row that should be rendered is a separate object in 'rows'
            fields: [
              {
                content: <string> || component: <object>,       --> define either 'content' or 'component' - never both!
                                                                --> see further down for an example of a defined 'component'

                props: <object>,                                --> define every attribute which should be bind to as properties of the 'props' object
                                                                --> i.e. class, id, ...
                                                                --> if 'component' is defined instead of 'content', the 'props' object also takes the
                                                                --> props of the given component
              },
              {
                component: {
                    tag: <string>,                              --> the value of 'tag' has to match a globally registered component
                                                                --> see main.js for all globally registered components
                    (content: <string>)                         --> optional
                },
                props: <object>,
              },  
              {
                content: <string> || component: <object>,
                props: <object>,
              },
              ...
            ],
            props: <object>                                     --> define every attribute which should be bind to as properties of the 'props' object
                                                                --> i.e. class, id, ...
          },
        ],
      },
    }
*/

import MoleculeTableHead from "@/components/molecules/MoleculeTableHead";
import MoleculeTableBody from "@/components/molecules/MoleculeTableBody";

export default {
  components: {
    MoleculeTableHead,
    MoleculeTableBody,
  },

  props: {
    config: {
      type: Object,
      required: true,
    },
  },
};
</script>