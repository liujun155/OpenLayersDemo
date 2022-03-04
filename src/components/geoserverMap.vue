<template>
  <div id="mapContainer"></div>
  <div id="popup" class="ol-popup">
    <div>
      <span class="ol-popup-title">属性信息</span>
      <a href="#" id="popup-closer" title="关闭" class="ol-popup-closer"></a>
    </div>
    <div id="popup-content" class="popup-content"></div>
  </div>
  <div>
    <a-input-search
      class="inputSearch"
      v-model:value="searchText"
      placeholder="搜索要素"
      enter-button
      @search="onSearch"
    />
  </div>
</template>

<script lang="ts">
import { message } from "ant-design-vue";
import { Map, View, Feature } from "ol";
import VectorSource from "ol/source/Vector";
import { Vector as VectorLayer } from "ol/layer";
import { Geometry, Polygon } from "ol/geom";
import GeoJSON from "ol/format/GeoJSON";
import { bbox as bboxStrategy } from "ol/loadingstrategy";
import TileLayer from "ol/layer/Tile";
import TileWMS from "ol/source/TileWMS";
import { click } from "ol/events/condition";
import Overlay from "ol/Overlay";
import { Select } from "ol/interaction";
import { getCenter } from "ol/extent";
import { Fill, Stroke, Style } from "ol/style";
import "ol/ol.css";
import { onMounted, onBeforeUnmount, ref } from "vue";
import { flyTo } from "../utils/mapUtil";

export default {
  name: "geoserverMap",
  setup() {
    let map: Map;
    let wkid = 4326;
    let searchText = ref("");
    let cur_selectFeature; //当前选择要素
    let cur_overlay: Overlay;
    let popup_container: HTMLElement;
    let popup_closer: HTMLElement;
    let popup_content: HTMLElement;
    onMounted(() => {
      popup_container = document.getElementById("popup") as HTMLElement;
      if (popup_container != null) popup_container.style.display = "none"; //默认隐藏
      popup_closer = document.getElementById("popup-closer") as HTMLElement;
      popup_content = document.getElementById("popup-content") as HTMLElement;
      let wmsLayer = new TileLayer({
        source: new TileWMS({
          url: "http://localhost:8080/geoserver/fangjia/wms",
          params: { LAYERS: "fangjia:community_price", singleTile: true },
          serverType: "geoserver",
          crossOrigin: "anonymous",
        }),
      });
      map = new Map({
        target: "mapContainer",
        view: new View({
          projection: "EPSG:4326",
          center: [116.38264, 39.90715],
          zoom: 12,
        }),
      });
      wmsLayer.set("name", "底图");
      map.addLayer(wmsLayer);

      //Overlay
      cur_overlay = new Overlay({
        element: popup_container,
      });
      map.addOverlay(cur_overlay);

      const vectorSource = new VectorSource({
        format: new GeoJSON(),
        url: "http://localhost:8080/geoserver/fangjia/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=fangjia%3Acommunity_price&outputFormat=application%2Fjson",
        strategy: bboxStrategy,
      });

      const vecLayer = new VectorLayer({
        source: vectorSource,
        style: new Style({
          stroke: new Stroke({
            color: "rgba(0, 0, 255, 0)",
            width: 1,
          }),
          fill: new Fill({
            color: "rgba(255, 0, 0, 0)",
          }),
        }),
      });
      vecLayer.set("name", "要素图层");
      map.addLayer(vecLayer);
      //属性弹框关闭按钮事件
      popup_closer.onclick = function () {
        cur_overlay.setPosition(undefined);
        popup_closer.blur();
        return false;
      };
      //地图点击事件
      map.on("singleclick", function (e) {
        //#region wms图层获取要素信息
        // const viewResolution = /** @type {number} */ map
        //   .getView()
        //   .getResolution();
        // let url = wmsLayer
        //   .getSource()
        //   .getFeatureInfoUrl(
        //     e.coordinate,
        //     viewResolution as number,
        //     "EPSG:4326",
        //     {
        //       INFO_FORMAT: "application/json",
        //     }
        //   );
        // axios
        //   .get(url as string)
        //   .then((response) => {
        //     console.log(response.data.features[0]);
        //     message.info(response.data.features[0].properties.name);
        //   })
        //   .catch(function (error) {
        //     // 请求失败处理
        //     console.warn(error);
        //   });
        //#endregion
        if (cur_selectFeature == undefined) return;
        if (popup_container != null) popup_container.style.display = "";
        popup_content.style.display = "block";
        let prop = cur_selectFeature.getProperties();
        popup_content.innerHTML =
          `<p title='ID：${prop["FID"]}' style='width: 11vw;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;float: left;'>ID：${prop["FID"]}</p>` +
          `<p title='名称：${prop["name"]}' style='width: 11vw;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;float: left;'>名称：${prop["name"]}</p>`;
        cur_overlay.setPosition(e.coordinate);
      });
      //鼠标移动事件
      map.on("pointermove", function (e) {
        var pixel = map.getEventPixel(e.originalEvent);
        var feature = map.forEachFeatureAtPixel(pixel, function (feature) {
          return feature;
        });
        map.getTargetElement().style.cursor =
          feature == undefined ? "" : "pointer";
      });

      const selectStyle = new Style({
        fill: new Fill({
          color: "#1E90FF50",
        }),
        stroke: new Stroke({
          color: "rgba(30, 144, 255, 0.5)",
          width: 2,
        }),
      });
      let layer_select = new Select({
        condition: click,
        // layers: [wmsLayer],
        style: selectStyle,
        // multi: true
      });
      layer_select.set("name", "图层选择");
      layer_select.on("select", (e) => {
        //获取选中要素中心点
        if (e.selected.length == 0) {
          cur_selectFeature = undefined;
          cur_overlay.setPosition(undefined);
          popup_closer.blur();
          return;
        }
        let features = (e.target as any).getFeatures().getArray();
        cur_selectFeature = features[0];
        // message.info(cur_selectFeature.getProperties().name);
      });
      map.addInteraction(layer_select);
    });

    //上一次搜索到的要素
    let lastSearchFeature: Feature<Geometry>;
    //搜索要素方法
    function onSearch() {
      if (searchText.value == "") {
        if (lastSearchFeature != undefined)
          lastSearchFeature.setStyle(undefined);
        message.warn("请输入搜索条件");
        return;
      }
      let vecLayer;
      map.getLayers().forEach((layer, i) => {
        vecLayer = layer.get("name") == "要素图层" ? layer : undefined;
      });
      if (vecLayer == undefined) return;

      const selectStyle = new Style({
        fill: new Fill({
          color: "#FFFF0080",
        }),
        stroke: new Stroke({
          color: "#FFFF0080",
          width: 2,
        }),
      });
      let features = vecLayer.getSource().getFeatures();
      let hasRes = false; //是否找到结果
      for (let i = 0; i < features.length; i++) {
        const f = features[i];
        if (f.getProperties().name.indexOf(searchText.value) != -1) {
          //清空上一次筛选要素的样式
          if (lastSearchFeature != undefined)
            lastSearchFeature.setStyle(undefined);
          lastSearchFeature = f;
          //设置样式-高亮
          f.setStyle(selectStyle);
          let extent;
          let geo = f.getGeometry();
          if (geo != undefined) extent = geo.getExtent();
          //   map.getView().fit(extent);
          //飞到要素中心点位置
          flyTo(map, getCenter(extent), 14, () => {
            //do nothing.
          });
          hasRes = true;
          break;
        }
      }
      if (!hasRes) message.info("未找到要素");
    }

    onBeforeUnmount(() => {
      map.dispose();
    });
    return {
      searchText,
      onSearch,
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
.inputSearch {
  width: 260px;
  margin: 10px 0 0 40px;
}
.ol-popup {
  position: absolute;
  background-color: rgba(10, 28, 56, 0.8);
  -webkit-filter: drop-shadow(0 1px 4px rgba(0, 0, 0, 0.2));
  filter: drop-shadow(0 1px 4px rgba(0, 0, 0, 0.2));
  padding: 15px;
  border-radius: 10px;
  border: 1px solid #cccccc;
  bottom: 12px;
  left: -50px;
  color: #fff;
}
.ol-popup:after,
.ol-popup:before {
  top: 100%;
  border: solid transparent;
  content: " ";
  height: 0;
  width: 0;
  position: absolute;
  pointer-events: none;
}
.ol-popup:after {
  border-top-color: rgba(10, 28, 56, 0.8);
  border-width: 10px;
  left: 48px;
  margin-left: -10px;
}
.ol-popup:before {
  border-top-color: #cccccc;
  border-width: 11px;
  left: 48px;
  margin-left: -11px;
}
.ol-popup-title {
  font-size: 16px;
  font-weight: bold;
}
.ol-popup-closer {
  text-decoration: none;
  position: absolute;
  top: 15px;
  right: 8px;
  color: #fff;
  font-family: "";
}
.popup-content {
  width: 300px;
  margin-top: 10px;
  max-height: 350px;
  overflow-y: auto;
  font-size: 16px;
  .hr {
    margin: 8px 0 8px 0;
    margin: 8px 0 8px 0;
    border-bottom: 1px dashed #ccc;
    height: 1px;
    width: 100%;
    display: inline-block;
  }
  .infoCol {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 16px;
    margin: 5px 0 5px 0;
    cursor: default;
  }
}
.ol-popup-closer:after {
  content: "✖";
}
</style>
