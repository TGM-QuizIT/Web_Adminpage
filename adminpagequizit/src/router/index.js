import { createRouter, createWebHistory } from "vue-router";
import HomeView from "@/views/HomeView.vue";
import DatenverwaltungView from "@/views/DatenverwaltungView.vue";
import BenutzerverwaltungView from "@/views/BenutzerverwaltungView.vue";
import StatistikenView from "@/views/StatistikenView.vue";
import ProfilView from "@/views/ProfilView.vue";
import LoginView from "@/views/LoginView.vue";

const routes = [
  { path: "/", component: HomeView },
  { path: "/datenverwaltung", component: DatenverwaltungView },
  { path: "/benutzerverwaltung", component: BenutzerverwaltungView },
  { path: "/statistiken", component: StatistikenView },
  { path: "/profil", component: ProfilView },
  { path: "/login", component: LoginView },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
