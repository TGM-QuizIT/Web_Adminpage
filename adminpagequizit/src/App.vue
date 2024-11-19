<template>
  <div id="app">
    <NavigationBar />
    <router-view />
  </div>
</template>

<style>
@import "styles/fonts.css";

#app {
  font-family: var(--font-family-roboto), sans-serif;
  font-size: var(--font-size-medium);
  font-weight: var(--font-weight-regular);
  color: #2c3e50;
}

body {
  margin: 0;
}

nav {
  padding: 30px;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
}

nav a.router-link-exact-active {
  color: #42b983;
}
</style>
<script setup>
import NavigationBar from "@/components/NavigationBar.vue";
</script>
