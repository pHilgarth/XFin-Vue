
<template>
  <div class="xfin-card">
    <div
      class="xfin-card-header"
      :class="cardHeaderClassList"
      @click="cardExpanded = !cardExpanded"
    >
      <button
        class="btn xfin-card-header-btn"
        :class="{ collapsed: !cardExpanded }"
        type="button"
        data-toggle="collapse"
        :data-target="'#' + cardId"
        role="button"
        :aria-expanded="cardExpanded"
        :aria-controls="cardId">
        {{ cardHeadline }}
      </button>
      <div class="xfin-card-header-icon">
        <div class="icon-bar"></div>
        <div class="icon-bar"></div>
      </div>
    </div>
    <div :id="cardId" class="collapse multi-collapse xfin-card-body">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  computed: {
    cardHeaderClassList() {
      return this.cardExpanded ? "expanded" : "";
    },
  },

  data() {
    return {
      cardExpanded: this.cardExpandedProp,
    }
  },

  props: {
    cardExpandedProp: {
      type: Boolean,
      required: true,
    },

    cardHeadline: {
      type: String,
      required: true,
    },

    cardName: {
      type: String,
      required: true,
    },

    cardId: {
        type: String,
        required: true,
    }
  },
};
</script>
