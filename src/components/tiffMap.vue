<template>
  <div id="mapContainer"></div>
</template>

<script lang="ts">
import { onMounted } from "vue";
import { Map, View, Feature } from "ol";
import VectorSource from "ol/source/Vector";
import { Vector as VectorLayer } from "ol/layer";
import TileLayer from "ol/layer/Tile";
import TileWMS from "ol/source/TileWMS";
import { Fill, Stroke, Style } from "ol/style";
import GeoJSON from "ol/format/GeoJSON";
import { bbox as bboxStrategy } from "ol/loadingstrategy";
export default {
  setup() {
    let map: Map;
    onMounted(() => {
      let wmsLayer = new TileLayer({
        source: new TileWMS({
          url: "http://localhost:8080/geoserver/demo_building/wms",
          params: { LAYERS: "demo_building:building_dom", singleTile: true },
          serverType: "geoserver",
          crossOrigin: "anonymous",
        }),
      });
      map = new Map({
        target: "mapContainer",
        view: new View({
          projection: "EPSG:4326",
          center: [113.09695, 29.38105],
          zoom: 17,
        }),
      });
      map.addLayer(wmsLayer);
      const vectorSource = new VectorSource({
        format: new GeoJSON(),
        url: "http://localhost:8080/geoserver/demo_building/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=demo_building%3ABuildings&outputFormat=application%2Fjson",
        strategy: bboxStrategy,
      });

      const vecLayer = new VectorLayer({
        source: vectorSource,
        style: new Style({
          stroke: new Stroke({
            color: "rgba(0, 0, 255, 0.6)",
            width: 1,
          }),
          fill: new Fill({
            color: "rgba(255, 0, 0, 0.6)",
          }),
        }),
      });
      map.addLayer(vecLayer);
    });
  },
};
</script>

<style lang="less" scoped>
#mapContainer {
  width: 100%;
  height: 100%;
  left: 0;
  bottom: 0;
  position: absolute;
}
</style>
