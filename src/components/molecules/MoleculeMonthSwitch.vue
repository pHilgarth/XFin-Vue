<template>
  <div class="molecule-month-switch">
    <ul>
      <li v-for="(n, i) in 12" :key="n" @click="setMonth(i)" :class="getTabState(i)">{{ getMonthName(i) }}</li>
    </ul>
  </div>
</template>

<script>

import {monthService} from "@/services/month-service";

export default {
  data() {
    return {
      tabStates: this.getTabStates(),
    };
  },

  methods: {
    getMonthName(index) {
      return monthService.getMonthName(index);
    },

    getTabState(month) {
      return { active: this.tabStates[month] };
    },

    getTabStates() {
      let currentMonth = new Date().getMonth();

      let tabStates = {};

      for (let i = 0; i < 12; i++) {
        tabStates[i] = i === currentMonth;
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