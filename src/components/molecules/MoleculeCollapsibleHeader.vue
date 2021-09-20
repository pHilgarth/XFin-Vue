<template>
    <div class="xfin-collapsible__header" @click="$emit('state-switched')">
      <span class="xfin-collapsible__title">{{ title }}</span>
      <div class="xfin-collapsible__state">
        <div class="bar"></div>
        <div class="bar"></div>
      </div>
    </div>
</template>

<script>
export default {
    props: {
        title: { required: true }
    }
}
</script>