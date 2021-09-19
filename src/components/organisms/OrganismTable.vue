<template>
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

                props: <object>,                                --> define every attribute of the <td> element which should be bind to in that object
                                                                --> i.e. class, id, ...
              },
              {
                component: {
                    tag: <string>,                              --> the value of 'tag' has to match a globally registered component
                                                                --> see main.js for all globally registered components
                    (content: <string>),                        --> optional
                    props: <object>                             --> the props needed for the given component
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