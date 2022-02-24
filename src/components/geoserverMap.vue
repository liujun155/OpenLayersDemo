<template>
  <div id="mapContainer"></div>
</template>

<script lang="ts">
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import XYZ from "ol/source/XYZ";
import "ol/ol.css";
import { fromLonLat } from "ol/proj.js";
import { onMounted } from "@vue/runtime-core";
export default {
  name: "geoserverMap",
  setup(){
    let map;
  }
};
</script>

<style scoped>
#mapContainer {
  width: 100%;
  height: 100%;
  left: 0;
  bottom: 0;
  position: absolute;
}
</style>
