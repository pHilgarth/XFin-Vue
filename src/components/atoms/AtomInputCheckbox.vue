<template>
    <input
        type="checkbox"
        :id = id
        class="form-check-input"
    />
</template>

<script>
export default {
    props: {
        id: { type: String },
    }    
}
</script>