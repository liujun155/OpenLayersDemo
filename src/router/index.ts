import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import Home from "../views/Home.vue";
import MultiMap from "../components/multiMap.vue";
import TiandiMap from "../components/tiandituMap.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "Home",
    component: Home,
    meta: {
      title: '首页'
    }
  },
  {
    path: "/map",
    name: "Map",
    component: MultiMap,
    meta: {
      title: '分屏对比'
    }
  },
  {
    path: "/tiandi",
    name: "TiandiMap",
    component: TiandiMap,
    meta: {
      title: '天地图'
    }
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
