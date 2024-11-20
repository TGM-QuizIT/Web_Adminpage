<template>
  <nav>
    <div class="logo-container">
      <img
        src="@/assets/logo_quizit_lightmode_white.png"
        alt="Logo"
        class="logo"
      />
      <span class="title">Admin-Dashboard</span>
    </div>

    <div class="nav-items">
      <router-link to="/datenverwaltung" class="nav-item">
        Datenverwaltung
      </router-link>
      <router-link to="/benutzerverwaltung" class="nav-item">
        Benutzerverwaltung
      </router-link>
      <router-link to="/statistiken" class="nav-item">
        Statistiken
      </router-link>
    </div>
  </nav>
</template>

<script setup></script>

<style scoped>
nav {
  background-color: #009de0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo-container {
  display: flex;
  align-items: center;
}

.logo {
  width: 200px;
  height: auto;
  margin-right: 10px;
}

.title {
  color: white;
  font-size: 35px;
  margin-left: 10px;
}

.nav-items {
  display: flex;
  align-items: center;
}

.nav-item {
  color: white;
  margin-left: 20px;
  display: flex;
  align-items: center;
  text-decoration: none;
}

.nav-item i {
  margin-right: 5px;
}
.nav-item:hover {
  color: #ddd;
}
</style>
