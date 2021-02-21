<template>
  <div class="xfin-container">
    <div class="xfin-header">[LOGO]</div>
    <div class="xfin-body">
      <div class="xfin-sidebar">
        <ul class="xfin-menu">
          <li>
            <router-link to="/">Kontenübersicht</router-link>
          </li>
          <li>Dummy</li>
          <li>Dummy</li>
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
