<template>
    <div class="xfin-card-header" @click="$emit('state-switched')">
      <button class="btn xfin-card-header-btn">
        {{ title }}
      </button>
      <div class="xfin-card-header-icon">
        <div class="icon-bar"></div>
        <div class="icon-bar"></div>
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