<template>
  <div id="app">
    <NavigationBar />
    <router-view />
  </div>
</template>

<style>
@import "styles/fonts.css";
@import "material-symbols";

#app {
  font-family: var(--font-family-poppins), sans-serif;
  font-size: var(--font-size-medium);
  font-weight: var(--font-weight-regular);
  display: flex;
  flex-direction: column;
  height: 100vh;
}

body {
  margin: 0;
}

nav {
  padding: 30px;
}
</style>
<script setup>
import NavigationBar from "@/components/NavigationBar.vue";
</script>
