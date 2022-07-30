<template>
    <p class="atom-paragraph">{{ text }}</p>
</template>

<script>
export default {
    props: {
        text: { type: String },
    },
};
</script>