
<template>
  <div class="month-switch">
    <ul>
      <li @click="setMonth(0)" :class="getTabState(0)">Januar</li>
      <li @click="setMonth(1)" :class="getTabState(1)">Februar</li>
      <li @click="setMonth(2)" :class="getTabState(2)">März</li>
      <li @click="setMonth(3)" :class="getTabState(3)">April</li>
      <li @click="setMonth(4)" :class="getTabState(4)">Mai</li>
      <li @click="setMonth(5)" :class="getTabState(5)">Juni</li>
      <li @click="setMonth(6)" :class="getTabState(6)">Juli</li>
      <li @click="setMonth(7)" :class="getTabState(7)">August</li>
      <li @click="setMonth(8)" :class="getTabState(8)">September</li>
      <li @click="setMonth(9)" :class="getTabState(9)">Oktober</li>
      <li @click="setMonth(10)" :class="getTabState(10)">November</li>
      <li @click="setMonth(11)" :class="getTabState(11)">Dezember</li>
    </ul>
  </div>
</template>

<script>
export default {
  data() {
    return {
      tabStates: this.getTabStates(),
    };
  },

  methods: {
    getTabState(month) {
      return { active: this.tabStates[month] };
    },

    getTabStates() {
      let currentMonth = new Date().getMonth();

      let tabStates = {};

      for (let i = 0; i < 12; i++) {
        tabStates[i] = i === currentMonth ? true : false;
      }

      return tabStates;
    },

    setMonth(month) {
      let vue = this;
      Object.keys(this.tabStates).forEach((month) => {
        vue.tabStates[month] = false;
      });

      this.tabStates[month] = true;

      this.$emit("month-switched", month);
    },
  },
};
</script>
