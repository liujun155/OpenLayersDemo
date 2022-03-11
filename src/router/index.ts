import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import Home from "../views/Home.vue";
import MultiMap from "../components/multiMap.vue";
import TiandiMap from "../components/tiandituMap.vue";
import GeoserverMap from "../components/geoserverMap.vue";
import TiffMap from "../components/tiffMap.vue";
import BufferAnalysis from "../components/bufferAnalysis.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "Home",
    component: Home,
    meta: {
      title: "首页",
    },
  },
  {
    path: "/map",
    name: "Map",
    component: MultiMap,
    meta: {
      title: "分屏对比",
    },
  },
  {
    path: "/tiandi",
    name: "TiandiMap",
    component: TiandiMap,
    meta: {
      title: "天地图",
    },
  },
  {
    path: "/wmsmap",
    name: "GeoserverMap",
    component: GeoserverMap,
    meta: {
      title: "Geoserver WMS服务",
    },
  },
  {
    path: "/tiffmap",
    name: "TiffMap",
    component: TiffMap,
    meta: {
      title: "影像图",
    },
  },
  {
    path: "/bufferAnalysis",
    name: "BufferAnalysis",
    component: BufferAnalysis,
    meta: {
      title: "缓冲区分析",
    },
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
