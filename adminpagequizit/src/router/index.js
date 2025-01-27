import { createRouter, createWebHistory } from "vue-router";
import DatenverwaltungView from "@/views/DatenverwaltungView.vue";
import BenutzerverwaltungView from "@/views/BenutzerverwaltungView.vue";
import StatistikenView from "@/views/StatistikenView.vue";
import ProfilView from "@/views/ProfilView.vue";
import LoginView from "@/views/LoginView.vue";
import BenutzereinstellungenView from "@/views/BenutzereinstellungenView.vue";
import FaecherverwaltungView from "@/views/FaecherverwaltungView.vue";
import SchwerpunktverwaltungView from "@/views/SchwerpunktverwaltungView.vue";
import FragenverwaltungView from "@/views/FragenverwaltungView.vue";

const routes = [
  {
    path: "/datenverwaltung",
    component: DatenverwaltungView,
    meta: { showNavItems: true, requiresAuth: true },
  },
  {
    path: "/faecherverwaltung",
    component: FaecherverwaltungView,
    meta: { showNavItems: true, requiresAuth: true },
  },
  {
    path: "/benutzerverwaltung",
    component: BenutzerverwaltungView,
    meta: { showNavItems: true, requiresAuth: true },
  },
  {
    path: "/statistiken",
    component: StatistikenView,
    meta: { showNavItems: true, requiresAuth: true },
  },
  { path: "/profil", component: ProfilView, meta: { showNavItems: true, requiresAuth: true } },
  { path: "/login", component: LoginView, meta: { showNavItems: false } },
  {
    path: "/benutzereinstellungen",
    component: BenutzereinstellungenView,
    meta: { showNavItems: true, requiresAuth: true },
  },
  {
    path: "/schwerpunktverwaltung/",
    component: SchwerpunktverwaltungView,
    props: true,
    meta: { showNavItems: true, requiresAuth: true },
  },
  {
    path: "/fragenverwaltung/",
    component: FragenverwaltungView,
    props: true,
    meta: { showNavItems: true, requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('authToken');
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login');
  } else {
    next();
  }
});

export default router;
