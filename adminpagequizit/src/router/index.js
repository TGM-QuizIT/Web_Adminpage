import { createRouter, createWebHistory } from "vue-router";
import HomeView from "@/views/HomeView.vue";
import DatenverwaltungView from "@/views/DatenverwaltungView.vue";
import BenutzerverwaltungView from "@/views/BenutzerverwaltungView.vue";
import StatistikenView from "@/views/StatistikenView.vue";
import ProfilView from "@/views/ProfilView.vue";
import LoginView from "@/views/LoginView.vue";
import BenutzereinstellungenView from "@/views/BenutzereinstellungenView.vue";
import FaecherverwaltungView from "@/views/FaecherverwaltungView.vue";

const routes = [
  { path: "/", component: HomeView, meta: { showNavItems: true } },
  {
    path: "/datenverwaltung",
    component: DatenverwaltungView,
    meta: { showNavItems: true },
  },
  {
    path: "/benutzerverwaltung",
    component: BenutzerverwaltungView,
    meta: { showNavItems: true },
  },
  {
    path: "/statistiken",
    component: StatistikenView,
    meta: { showNavItems: true },
  },
  { path: "/profil", component: ProfilView, meta: { showNavItems: true } },
  { path: "/login", component: LoginView, meta: { showNavItems: false } },
  {
    path: "/benutzereinstellungen",
    component: BenutzereinstellungenView,
    meta: { showNavItems: true },
  },
  {
    path: "/faecherverwaltung",
    component: FaecherverwaltungView,
    meta: { showNavItems: true },
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
