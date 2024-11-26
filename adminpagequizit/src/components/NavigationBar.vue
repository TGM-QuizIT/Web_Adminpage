<script setup>
import { useRoute } from "vue-router";
import { ref, watch } from "vue";

const route = useRoute();

const showNavItems = ref(route.meta.showNavItems !== false);

watch(
  () => route.path,
  () => {
    showNavItems.value = route.meta.showNavItems !== false;
  }
);
</script>
<template>
  <nav>
    <router-link to="/home" class="nav-item" active-class="active">
      <div class="logo-container">
        <img
          src="@/assets/logo_quizit_blackwhite.png"
          alt="Logo"
          class="logo"
        />
        <span class="title">Admin-Dashboard</span>
      </div>
    </router-link>

    <div class="nav-items-and-profile" v-if="showNavItems">
      <div class="nav-items">
        <div class="item-group">
          <router-link
            to="/datenverwaltung"
            class="nav-item"
            active-class="active"
          >
            <span class="material-symbols-outlined">database</span>
            <p class="nav-item-text">Datenverwaltung</p>
          </router-link>
        </div>
        <div class="item-group">
          <router-link
            to="/benutzerverwaltung"
            class="nav-item"
            active-class="active"
          >
            <span class="material-symbols-outlined">manage_accounts</span>
            <p class="nav-item-text">Benutzerverwaltung</p>
          </router-link>
        </div>
        <div class="item-group">
          <router-link to="/statistiken" class="nav-item" active-class="active">
            <span class="material-symbols-outlined">analytics</span>
            <p class="nav-item-text">Statistiken</p>
          </router-link>
        </div>
      </div>
      <div class="profil-frame">
        <router-link to="/profil" class="profil-link">
          <span class="material-symbols-outlined">account_circle</span>
        </router-link>
      </div>
    </div>
  </nav>
</template>

<style scoped>
nav {
  background-color: #009de0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100px;
  padding: 0 0 0 20px;
  margin: 0;
}

.nav-items-and-profile {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0;
  padding: 0;
  height: 100%;
}

.logo-container {
  display: flex;
  align-items: center;
}

.logo {
  width: 200px;
  height: auto;
  margin-right: 40px;
}

.title {
  color: white;
  font-size: 32px;
}

.nav-items {
  display: flex;
  align-items: center;
  margin: 0;
  padding: 0;
  height: 100%;
}

.item-group {
  height: 100%;
  display: flex;
  align-items: center;
}

.nav-item {
  color: white;
  font-weight: bold;
  padding: 0 20px;
  height: 100%;
  display: flex;
  align-items: center;
  text-decoration: none;
}

.item-group:hover {
  background-color: rgba(0, 0, 0, 0.2);
  transition: background-color 0.3s ease;
}

.item-group:hover .nav-item {
  color: white;
}

.nav-item.active {
  color: #c1272d;
}

.nav-item.active:hover {
  color: #c1272d;
}

.nav-item:hover {
  color: #ddd;
}

.nav-item-text {
  margin-left: 10px;
  pointer-events: none;
  font-size: 20px;
}

.profil-frame {
  height: 100%;
  margin: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.profil-link {
  color: white;
}

.profil-link span {
  font-size: 64px;
}

.profil-link:hover span {
  color: #ddd;
  transition: color 0.3s ease-in-out;
}
</style>
