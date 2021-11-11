import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import Home from "../views/Home.vue";
import MapOl from "../components/multiMap.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/map",
    name: "Map",
    component: MapOl,
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
