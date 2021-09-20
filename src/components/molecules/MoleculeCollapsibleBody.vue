<template>
    <section class="xfin-card-body" :class="{ ' collapsed': collapsed }">
      <slot></slot>
    </section>
</template>

<script>
export default {
    props: {
        collapsed: { required: true }
    }
}
</script>