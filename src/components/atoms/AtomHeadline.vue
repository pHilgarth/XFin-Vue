<template>
    <component :is="tag">{{ content }}</component>
</template>

<script>
export default {
    props: {
        content: { required: true },
        tag: { required: true },
    }
}
</script>