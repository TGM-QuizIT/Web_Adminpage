<script setup>
import { useRouter } from "vue-router";
const router = useRouter();

function goToLogin() {
  router.push("/login");
}
</script>

<template>
  <div class="page-container">
    <p class="welcome-text">Angemeldet als: Nikolaus Redl</p>
    <button @click="goToLogin" class="logout">
      <p>Abmelden</p>
    </button>
  </div>
</template>

<style scoped>
html,
body {
  height: 100%;
}

.page-container {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  margin: 1% 0 0 3%;
  flex: 1;
}

.welcome-text {
  text-align: left;
}

.logout {
  padding: 10px;
  background-color: #c1272d;
  color: #fff;
  font-size: 14px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}
</style>
