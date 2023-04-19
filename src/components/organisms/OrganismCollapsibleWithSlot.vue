<template>
  <div class="organism-collapsible accordion-item">
    <div class="organism-collapsible__header accordion-header" :id="`heading-${accordionId}`">
      <button class="accordion-button" type="button" data-bs-toggle="collapse" :data-bs-target="`#collapse-${accordionId}`">
        <span class="organism-collapsible__headline">{{ title }}</span>
      </button>
      <div class="molecule-collapsible-header__state">
        <div class="molecule-collapsible-header__bar"></div>
        <div class="molecule-collapsible-header__bar"></div>
      </div>
    </div>
    <div class="accordion-collapse collapse" :id="`collapse-${accordionId}`">
      <slot></slot>
    </div>
  </div>
</template>

<script>

export default {

  props: {
    accordionId : { type: String, required: true },
    title: { type: String, required: true }
  },
};

</script>