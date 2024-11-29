<script setup>
import { useRouter } from "vue-router";
const router = useRouter();

function goToFaecher() {
  router.push("/faecherverwaltung");
}
function goToSchwerpunkt() {
  router.push("/schwerpunktverwaltung");
}
function goToFragen() {
  router.push("/fragenverwaltung");
}
</script>

<template>
  <div class="page-container">
    <p class="welcome-text">Willkommen im Admin-Dashboard</p>
    <div class="link-buttons-container">
      <button @click="goToFaecher" class="link-button">Fächer verwalten</button>
      <button @click="goToSchwerpunkt" class="link-button">
        Schwerpunkte verwalten
      </button>
      <button @click="goToFragen" class="link-button">Fragen verwalten</button>
    </div>
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
  margin: 1% 3% 0 3%;
  flex: 1;
}

.welcome-text {
  text-align: left;
  margin-bottom: 4%;
}

.link-button {
  padding: 20px 100px;
  font-size: 16px;
  font-weight: bold;
  background-color: #f0f0f0;
  color: black;
  border: 2px solid #009de0;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.2);
  white-space: nowrap;
}

.link-button:hover {
  background-color: #009de0;
  color: white;
  transform: translateY(-3px);
}

.link-button:active {
  transform: translateY(2px);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.link-buttons-container {
  width: 100%;
  display: flex;
  justify-content: space-between;
}
</style>
