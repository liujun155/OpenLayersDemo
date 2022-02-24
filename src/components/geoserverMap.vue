<template>
  <div id="mapContainer"></div>
</template>

<script lang="ts">
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import TileWMS from "ol/source/TileWMS";
import "ol/ol.css";
import { onMounted } from "@vue/runtime-core";

export default {
  name: "geoserverMap",
  setup() {
    let map;
    let wkid = 4326;
    onMounted(() => {
      let wmsLayer = new TileLayer({
        source: new TileWMS({
          url: 'http://localhost:8080/geoserver/fangjia/wms',
          params: { 'LAYERS': 'fangjia:community_price', 'singleTile': true }
        })
      });
      map = new Map({
        target: "mapContainer",
        view: new View({
          projection: "EPSG:4326",
          center: [116.38264, 39.90715],
          zoom: 12,
        }),
      });
      map.addLayer(wmsLayer);
    });
  },
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
