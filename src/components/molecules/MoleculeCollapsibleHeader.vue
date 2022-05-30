<template>
    <div class="molecule-collapsible-header" @click="$emit('state-switched')">
      <span class="molecule-collapsible-header__title">{{ title }}</span>
      <div class="molecule-collapsible-header__state">
        <div class="molecule-collapsible-header__bar"></div>
        <div class="molecule-collapsible-header__bar"></div>
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