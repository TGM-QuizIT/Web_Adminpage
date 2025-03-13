<script setup>
import { useRouter } from "vue-router";
const router = useRouter();

function goToLogin() {
  router.push("/login");
}
</script>

<template>
  <div class="page-container">
    <div class="button-container">
      <button @click="goToLogin" class="logout">
        <p>Abmelden</p>
      </button>
    </div>
  </div>
</template>

<style scoped>
html,
body {
  height: 100%;
  margin: 0;
}

.page-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.button-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.logout {
  padding: 15px 30px;
  background-color: #c1272d;
  color: #fff;
  font-size: 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.logout:hover {
  background-color: #a02025;
}
</style>