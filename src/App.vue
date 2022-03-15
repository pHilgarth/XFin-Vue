<template>
  <div class="xfin">
    <div class="xfin__header">[LOGO]</div>
    <div class="xfin__body">
      <div class="xfin__sidebar">
        <ul class="xfin__menu">
          <li :class="selectedMenuItem == 1 ? 'active' : ''" data-route="/" data-index="1" @click="routeToComponent">
            Kontenübersicht
          </li>
          <li :class="selectedMenuItem == 2 ? 'active' : ''" data-route="/budget-manager" data-index="2" @click="routeToComponent">
            Budgetmanager
          </li>
          <li :class="selectedMenuItem == 3 ? 'active' : ''" data-route="/design-elements" data-index="3" @click="routeToComponent">
            Design-Elemente (Dev)
          </li>
        </ul>
      </div>
      <div class="xfin__content">
        <div class="xfin__component">
          <router-view></router-view>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      selectedMenuItem: 1,
    };
  },

  methods: {
    routeToComponent(event) {
      this.selectedMenuItem = event.target.dataset.index;
      this.$router.push(event.target.dataset.route);
    }
  }
}
</script>
<style lang="scss">
  @import "../public/styles/styles";
</style>
