<template>
  <div id="mapContainer"></div>
  <a-button style="margin: 30px 0 0 50px" type="primary" @click="changeMap()"
    >影像/矢量图</a-button
  >
</template>

<script lang="ts">
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import XYZ from "ol/source/XYZ";
import "ol/ol.css";
import { fromLonLat } from "ol/proj.js";
import { onMounted, onBeforeUnmount } from "@vue/runtime-core";
export default {
  setup() {
    let map: Map;
    let wkid = 4326;
    let token = "f3ff25c830f9dc000c30a22e17e889f4";

    //创建天地图影像底图
    let layerTianDiImg = new TileLayer({
      source: new XYZ({
        url: getLayerUrlByData("image", wkid, token),
        projection: "EPSG:" + wkid,
        wrapX: true,
        crossOrigin: "anonymous",
      }),
    });
    //天地图影像注记
    let layerTianDiImgLabel = new TileLayer({
      source: new XYZ({
        url: getLayerUrlByData("label", wkid, token),
        projection: "EPSG:" + wkid,
        wrapX: true,
        crossOrigin: "anonymous",
      }),
    });

    //创建天地图矢量底图
    let layerTianDi = new TileLayer({
      source: new XYZ({
        url: getLayerUrlByData("street", wkid, token),
        projection: "EPSG:" + wkid,
        wrapX: true,
        crossOrigin: "anonymous",
      }),
    });
    //天地图矢量注记
    let layerTianDiLabel = new TileLayer({
      source: new XYZ({
        url: getLayerUrlByData("street_label", wkid, token),
        projection: "EPSG:" + wkid,
        wrapX: true,
        crossOrigin: "anonymous",
      }),
    });
    onMounted(() => {
      //初始化地图
      map = new Map({
        target: "mapContainer",
        view: new View({
          projection: "EPSG:4326",
          center: [108.961029, 34.208386],
          zoom: 12,
        }),
      });
      map.addLayer(layerTianDi);
      map.addLayer(layerTianDiLabel);
      // map.addLayer(layerTianDiImg);
      // map.addLayer(layerTianDiImgLabel);
    });

    let curMapType = "vec";
    function changeMap() {
      if (curMapType == "vec") {
        map.removeLayer(layerTianDi);
        map.removeLayer(layerTianDiLabel);
        map.addLayer(layerTianDiImg);
        map.addLayer(layerTianDiImgLabel);
        curMapType = "img";
      } else if (curMapType == "img") {
        map.removeLayer(layerTianDiImg);
        map.removeLayer(layerTianDiImgLabel);
        map.addLayer(layerTianDi);
        map.addLayer(layerTianDiLabel);
        curMapType = "vec";
      }
    }

    /*
     * 获取在线天地图
     * type:获取的瓦片类型，影像、矢量
     * wkid:坐标系
     * token:官网申请的开发者token
     */
    function getLayerUrlByData(type, wkid, token) {
      let url = "",
        layerId,
        tileMatrixSetId;
      if (type === "image") {
        url = "http://t{0-7}.tianditu.gov.cn/DataServer?";
        layerId = "img_";
        tileMatrixSetId = wkid === 4326 ? "c" : "w";
      } else if (type === "label") {
        url = "http://t{0-7}.tianditu.gov.cn/DataServer?";
        layerId = "cia_";
        tileMatrixSetId = wkid === 4326 ? "c" : "w";
      } else if (type === "street") {
        url = "http://t{0-7}.tianditu.gov.cn/DataServer?";
        layerId = "vec_";
        tileMatrixSetId = wkid === 4326 ? "c" : "w";
      } else if (type === "street_label") {
        url = "http://t{0-7}.tianditu.gov.cn/DataServer?";
        layerId = "cva_";
        tileMatrixSetId = wkid === 4326 ? "c" : "w";
      }
      return (
        url +
        "T=" +
        layerId +
        tileMatrixSetId +
        "&x={x}&y={y}&l={z}&tk=" +
        token
      );
    }
    onBeforeUnmount(() => {
      map.dispose();
    });
    return {
      changeMap,
    };
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
