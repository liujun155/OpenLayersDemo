<template>
  <div id="mapContainer"></div>
  <div id="mapContainer2"></div>
</template>

<script lang="ts">
import "ol/ol.css";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import { onMounted } from "@vue/runtime-core";
export default {
  setup() {
    let allMaps: Map[] = [];
    let view = new View({
      projection: "EPSG:4326",
      center: [108.961029, 34.208386],
      zoom: 12,
    });
    onMounted(() => {
      let map = new Map({
        target: "mapContainer",
        layers: [
          new TileLayer({
            source: new OSM(),
          }),
        ],
        view: view,
      });
      console.log(map);
      let map2 = new Map({
        target: "mapContainer2",
        layers: [
          new TileLayer({
            source: new OSM(),
          }),
        ],
        view: view,
      });
      console.log(map2);
      allMaps = [map, map2];
    });

    // let _test_move = true;
    // function togetherMove() {
    //   allMaps[0].on("postrender", function (e) {
    //     var c0 = allMaps[0].getView().getCenter();
    //     var z0 = allMaps[0].getView().getZoom();
    //     if (allMaps[1]) {
    //       allMaps[1].getView().setCenter(c0, z0);
    //       allMaps[1].getView().setZoom(z0);
    //     }
    //   });
    //   if (allMaps[1])
    //     allMaps[1].on("postrender", function (e) {
    //       var c1 = allMaps[1].getView().getCenter();
    //       var z1 = allMaps[1].getView().getZoom();
    //       allMaps[0].getView().setCenter(c1, z1);
    //       allMaps[0].getView().setZoom(z1);
    //     });
    // }
  },
};
</script>
<style>
#mapContainer {
  width: 50%;
  height: 100%;
  left: 0;
  bottom: 0;
  position: absolute;
}
#mapContainer2 {
  width: 50%;
  height: 100%;
  right: 0;
  bottom: 0;
  position: absolute;
}
</style>
