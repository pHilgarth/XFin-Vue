<template>
  <div class="xfin-card">
    <div
      :class="'xfin-card-header' + cardHeaderClassList"
      @click="cardExpanded = !cardExpanded"
    >
      <button
        :class="'btn xfin-card-header-btn ' + { collapsed: !cardExpanded }"
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
      return this.cardExpanded ? " expanded" : "";
    },
  },

  data() {
    return {
      cardExpanded: this.cardConfig.cardExpanded,
      cardHeadline: this.cardConfig.cardHeadline,
      cardId: this.cardConfig.cardId,
    }
  },

  props: {
    cardConfig: {
      type: Object,
      required: true
    }
  },
};
</script>
