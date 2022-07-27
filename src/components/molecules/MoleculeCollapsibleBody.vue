<template>
  <div :class="`molecule-collapsible-body${ collapsed ? ' collapsed' : ''}`">
    <slot></slot>
  </div>
</template>

<script>
export default {
  props: {
    collapsed: { required: true }
  }
}
</script>