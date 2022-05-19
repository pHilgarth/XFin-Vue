<!-- TODO - rework this component - it's unused right now -->
<!-- TODO - this component is using the v-html directive - make sure it always gets trusted content! -->
<template>
    <div class="xfin-card" v-bind="config.props">
      <span class="dev-hint">this component is unsing the v-html directive - make sure it always gets trusted content!</span>
      <div class="xfin-card__content" v-for="(content, index) in config.content" :key="index" v-bind="content.props">
        <div v-if="content.content" v-html="content.content"></div>
        <template v-else-if="content.component">
            <component :is="content.component.tag" v-bind="content.component.props" />
        </template>
      </div>
    </div>
</template>

<script>
  //  COMPONENT DOCS
  //     Props:
  //     config: {
  //       content: [
  //         {
  //           content: <string> || component: <object>,     --> either a simple string (optional with html) or an object to render a component
  //                                                         --> see next sample object for the required component properties
  //           props: <object>,                              --> every attribute to bind to along with the desired value (i.e. class: amount < 0 ? 'negative' : '')
  //         },
  //         {
  //           component: {
  //             tag: <string>                               --> has to match a globally registered component name (see main.js for all globally registered components)
  //             props: <object>                             --> the props expected by the given component
  //           }
  //         }
  //       ],
  //       props: <object>                                   --> attributes to bind some value to on the div.xfin-card
  //     };
  

  export default {
      props: {
          config: {
              type: Object,
              required: true,
          },
      },
  }
</script>