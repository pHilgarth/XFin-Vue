<template>
    <div class="xfin-card-body" :class="{ ' collapsed': collapsed }">
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