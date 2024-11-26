<script setup></script>

<template>
  <div class="page-container">
    <h1 class="user-info">Benutzer:</h1>
    <h2 class="user-info">Rolle:</h2>
    <h2 class="user-info">Klasse:</h2>
    <h3 class="user-info">Anzahl abgeschlossener Quizze:</h3>
    <h3 class="user-info">Durchschnittlicher erreichter Prozentsatz:</h3>
    <button class="deactivate-user"><p>Benutzer deaktivieren</p></button>
  </div>
</template>

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  margin: 1% 0 0 3%;
  flex: 1;
}

.user-info {
  margin-bottom: 1%;
}

.deactivate-user {
  padding: 10px;
  background-color: #c1272d;
  color: #fff;
  font-size: 14px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.deactivate-user:hover {
  background-color: #911b20;
}
</style>
