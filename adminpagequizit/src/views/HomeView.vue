<template>
  <div class="home">
    <p class="welcome-text">Willkommen im Admin-Dashboard</p>
  </div>
</template>

<script>
export default {
  name: "HomeView",
  components: {},
};
</script>

<style>
.welcome-text {
  color: #000000;
  font-size: 24px;
  font-weight: bold;
}

.home {
  display: flex;
  justify-content: center;
  margin: 20px;
}
</style>
