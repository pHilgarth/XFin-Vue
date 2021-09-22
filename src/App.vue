<template>
  <div class="xfin-container">
    <div class="xfin-header">[LOGO]</div>
    <div class="xfin-body">
      <div class="xfin-sidebar">
        <ul class="xfin-menu">
          <li>
            <router-link to="/">Kontenübersicht</router-link>
          </li>
          <li>
            <router-link to="/budget-manager">Budgetmanager</router-link>
          </li>
          <li>
            <!-- TODO - delete this link, the component is/was just for testing purposes -->
            <router-link to="/testform">Test-Form</router-link>
          </li>
        </ul>
      </div>
      <div class="xfin-content">
        <div class="xfin-component">
          <router-view></router-view>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
  @import "../public/styles/styles";
</style>
