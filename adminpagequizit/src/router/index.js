import { createRouter, createWebHistory } from "vue-router";
import HomeView from "@/views/HomeView.vue";
import DatenverwaltungView from "@/views/DatenverwaltungView.vue";
import BenutzerverwaltungView from "@/views/BenutzerverwaltungView.vue";
import StatistikenView from "@/views/StatistikenView.vue";

const routes = [
  { path: "/", component: HomeView },
  { path: "/datenverwaltung", component: DatenverwaltungView },
  { path: "/benutzerverwaltung", component: BenutzerverwaltungView },
  { path: "/statistiken", component: StatistikenView },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
