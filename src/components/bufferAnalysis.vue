<template>
  <div id="mapContainer"></div>
  <a-card id="card" title="缓冲区分析">
    <a-row class="cardRow">
      <a-col :span="4">范围：</a-col>
      <a-col :span="12">
        <a-slider
          v-model:value="range"
          :min="0.1"
          :max="10"
          :step="0.1"
          @change="rangeChanged"
        />
      </a-col>
      <a-col :span="4">
        <a-input-number
          class="inputNum"
          v-model:value="range"
          :min="0.1"
          :max="10"
          :step="0.1"
          @change="rangeChanged"
        />
      </a-col>
    </a-row>
    <a-row class="cardRow" style="margin: 20px 0 0 0">
      <a-col :span="4">类型：</a-col>
      <a-col :span="12">
        <a-select
          ref="select"
          v-model:value="selectedType"
          style="width: 120px"
          @change="typeChanged"
        >
          <a-select-option value="Point">点</a-select-option>
          <a-select-option value="LineString">线</a-select-option>
          <a-select-option value="Polygon">面</a-select-option>
        </a-select>
      </a-col>
    </a-row>
    <a-row class="cardRow" style="margin: 20px 0 0 0; float: right">
      <a-button type="primary" @click="addInteraction()">创建缓冲区</a-button>
      <a-button type="primary" @click="clearBuffer()" style="margin-left: 20px"
        >清除结果</a-button
      >
    </a-row>
    <a-row class="cardRow" style="margin: 20px 0 0 0; float: left">
      <a-list bordered :data-source="resultData" style="width: 100%">
        <template #renderItem="{ item }">
          <a-list-item style="color: #fff">
            <a href="javascript:void(0)" @click="location(item)">{{
              item.name
            }}</a>
          </a-list-item>
        </template>
        <template #header>
          <h3 style="color: #fff">分析结果</h3>
        </template>
      </a-list>
    </a-row>
  </a-card>
  <div id="mouse-position"></div>
</template>

<script lang="ts">
import { message } from "ant-design-vue";
import { Map, View, Feature } from "ol";
import OSM from "ol/source/OSM";
import VectorSource from "ol/source/Vector";
import { Vector as VectorLayer } from "ol/layer";
import { Geometry, Polygon, MultiPolygon, LineString, Point } from "ol/geom";
import GeoJSON from "ol/format/GeoJSON";
import { bbox as bboxStrategy } from "ol/loadingstrategy";
import TileLayer from "ol/layer/Tile";
import TileWMS from "ol/source/TileWMS";
import { click } from "ol/events/condition";
import Overlay from "ol/Overlay";
import { Draw, Select } from "ol/interaction";
import { getCenter, buffer } from "ol/extent";
import { Fill, Stroke, Circle, Icon, Text, Style } from "ol/style";
import { createStringXY } from "ol/coordinate";
import MousePosition from "ol/control/MousePosition";
import { defaults as defaultControls } from "ol/control";
import { onMounted, onBeforeUnmount, ref, toRaw } from "vue";
import * as mapUtil from "../utils/mapUtil";
import * as turf from "@turf/turf";
import { transform } from "ol/proj";
import { DrawEvent } from "ol/interaction/Draw";
import img_location from "../assets/location.png";
export default {
  setup() {
    let map: Map;
    let range = ref(0.5); //缓冲区半径
    let selectedType = ref("Point");
    let resultData = ref(); //分析结果list
    const mousePositionControl = new MousePosition({
      coordinateFormat: createStringXY(4),
      projection: "EPSG:3857",
      className: "custom-mouse-position",
      target: document.getElementById("mouse-position") as HTMLElement,
    });

    //要素点样式（带标注）
    const pointStyle = function (feature, resolution) {
      const name = feature.getProperties().Name;
      let pointStyle = new Style({
        image: new Circle({
          // 点的颜色
          fill: new Fill({
            color: "#FF0000",
          }),
          stroke: new Stroke({
            color: "#000000",
            width: 1,
          }),
          // 圆形半径
          radius: 5,
        }),
      });
      if (name != undefined) {
        pointStyle.setText(
          new Text({
            text: name,
            font: "bold 17px sans-serif",
            fill: new Fill({
              color: "#62718A",
            }),
            backgroundFill: new Fill({ color: "#FFFFFF01" }),
            textBaseline: "bottom",
            offsetY: -5,
          })
        );
      }
      return pointStyle;
    };

    let vecSource: VectorSource<Geometry>;
    onMounted(() => {
      map = new Map({
        target: "mapContainer",
        controls: defaultControls().extend([mousePositionControl]),
        layers: [
          new TileLayer({
            source: new OSM(),
          }),
        ],
        view: new View({
          projection: "EPSG:3857",
          center: [12131575.208, 4056738.057],
          zoom: 16,
        }),
      });
      //点要素
      vecSource = new VectorSource({
        format: new GeoJSON(),
        url: "http://localhost:8080/geoserver/city_points/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=city_points%3Acity_points&outputFormat=application%2Fjson",
        strategy: bboxStrategy,
      });
      let vecLayer = new VectorLayer({
        source: vecSource,
        style: pointStyle,
      });
      map.addLayer(vecLayer);

      map.on("singleclick", function (e) {
        let features: Feature<Geometry>[] = vecSource.getFeatures();
        // for (let i = 0; i < features.length; i++) {
        //   const f = features[i];
        //   let geo = f.getGeometry();
        //   if (geo != undefined) {
        //     mapUtil.flyTo(map, geo.getExtent(), 16, () => {
        //       //do nothing
        //       message.success(`已定位${f.getProperties().Name}`);
        //     });
        //     // bufferit(f, 20);
        //     turfBuffer(f, range.value);
        //     break;
        //   }
        // }
      });

      map.on("pointermove", (e) => {
        let pixel = map.getEventPixel(e.originalEvent);
        let feature = map.forEachFeatureAtPixel(pixel, function (feature) {
          return feature;
        });
        map.getTargetElement().style.cursor =
          feature == undefined ? "" : "pointer";
      });
    });

    let draw;
    const drawSource = new VectorSource({ wrapX: false });
    const drawLayer = new VectorLayer({
      source: drawSource,
    });
    drawLayer.set("name", "绘制图层");
    //添加绘图事件
    function addInteraction() {
      if (draw != undefined) map.removeInteraction(draw);
      draw = new Draw({
        source: drawSource,
        type: selectedType.value,
      });
      draw.on("drawstart", function (e: DrawEvent) {
        drawSource.clear();
        bufferVectorSource.clear();
      });
      draw.on("drawend", function (e: DrawEvent) {
        turfBuffer(e.feature, range.value);
      });
      map.addInteraction(draw);
      if (mapUtil.getLayerByName(map, "绘制图层") == undefined)
        map.addLayer(drawLayer);
    }

    let curBufferFeature: Feature<Geometry>;
    let bufferVectorSource = new VectorSource<Geometry>();
    let bufferLayer = new VectorLayer();
    const bfLayerName = "缓冲区";
    bufferLayer.set("name", bfLayerName);
    //创建缓冲区
    function turfBuffer(feature: Feature<Geometry>, rangeNum: number) {
      let featureGeo = feature.getGeometry();
      if (featureGeo == undefined) return;
      bufferVectorSource.clear();
      curBufferFeature = feature;
      //坐标点转为4326 turf缓冲区只支持4326坐标
      let turfGeo;
      if (featureGeo.getType() == "Point") {
        const transPoint = transform(
          getCenter(featureGeo.getExtent()),
          "EPSG:3857",
          "EPSG:4326"
        );
        //创建缓冲数据
        turfGeo = (turf as any).point(transPoint);
      } else if (featureGeo.getType() == "LineString") {
        const fcl = featureGeo.clone();
        fcl.transform("EPSG:3857", "EPSG:4326");
        let transCoordinates = (fcl as LineString).getCoordinates();
        turfGeo = (turf as any).lineString(transCoordinates);
      } else if (featureGeo.getType() == "Polygon") {
        const fcl = featureGeo.clone();
        fcl.transform("EPSG:3857", "EPSG:4326");
        let transCoordinates = (fcl as Polygon).getCoordinates();
        turfGeo = (turf as any).polygon(transCoordinates);
      }
      var buffered = turf.buffer(turfGeo, rangeNum, {
        units: "kilometers",
      });

      //创建数据geojson对象和数据源对象
      var format = new GeoJSON();
      //读取geojson数据
      var b = format.readFeature(buffered);
      b.getGeometry().transform("EPSG:4326", "EPSG:3857");
      //将数据添加数据源的
      bufferVectorSource.addFeature(b);
      //添加图层
      bufferLayer.setSource(bufferVectorSource);
      if (mapUtil.getLayerByName(map, bfLayerName) == undefined) {
        map.addLayer(bufferLayer);
      }
      //分析结果
      pointWithinBuffer(buffered);
    }
    //查找缓冲区内要素点
    let rsSource = new VectorSource();
    let rsLayer = new VectorLayer();
    rsLayer.set("name", "分析结果");
    function pointWithinBuffer(buffered) {
      rsSource.clear();
      //要素坐标转换
      let transFeautres: Feature<Geometry>[] = [];
      for (let i = 0; i < vecSource.getFeatures().length; i++) {
        const f = vecSource.getFeatures()[i];
        let clf = f.clone();
        (clf.getGeometry() as Geometry).transform("EPSG:3857", "EPSG:4326");
        transFeautres.push(clf);
      }
      //转为geojson
      var format = new GeoJSON();
      let tfPoints = format.writeFeaturesObject(transFeautres);
      //找到落在缓冲区内的点
      var ptsWithin = turf.pointsWithinPolygon(tfPoints, buffered);
      let fpts = format.readFeatures(ptsWithin);
      //转换回3857
      for (let i = 0; i < fpts.length; i++) {
        const f = fpts[i];
        (f.getGeometry() as Geometry).transform("EPSG:4326", "EPSG:3857");
        rsSource.addFeature(f);
      }
      //设置图层
      let rsStyle = new Style({
        image: new Icon({
          anchor: [0.5, 0.9],
          src: img_location,
        }),
      });
      rsLayer.setSource(rsSource);
      rsLayer.setStyle(rsStyle);
      if (mapUtil.getLayerByName(map, "分析结果") == undefined) {
        map.addLayer(rsLayer);
      }
      //输出分析结果到列表
      resultData.value = [];
      for (let i = 0; i < rsSource.getFeatures().length; i++) {
        const f = rsSource.getFeatures()[i];
        resultData.value.push({ name: f.getProperties().Name, feature: f });
      }
    }

    //定位到分析结果
    function location(item) {
      let geo = (toRaw(item).feature as Feature<Geometry>).getGeometry();
      if (geo != undefined) {
        mapUtil.flyTo(map, geo.getExtent(), 18, () => {
          //do nothing
        });
      }
    }

    //类型选择改变事件
    function typeChanged() {
      clearBuffer();
      addInteraction();
    }

    //范围Slider改变事件
    function rangeChanged() {
      if (curBufferFeature == undefined) return;
      if (mapUtil.getLayerByName(map, bfLayerName) == undefined) return;
      turfBuffer(curBufferFeature, range.value);
    }

    //清除缓冲区
    function clearBuffer() {
      map.removeInteraction(draw);
      bufferVectorSource.clear();
      map.removeLayer(bufferLayer);
      drawSource.clear();
      map.removeLayer(drawLayer);
      rsSource.clear();
      map.removeLayer(rsLayer);
      resultData.value = [];
    }
    return {
      range,
      selectedType,
      resultData,
      addInteraction,
      typeChanged,
      rangeChanged,
      clearBuffer,
      location,
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
#card {
  width: 350px;
  background-color: #008b8b;
  position: absolute;
  top: 10px;
  left: 40px;
  .cardRow {
    width: 100%;
    line-height: 40px;
    .inputNum {
      margin-left: 15px;
    }
  }
}
a {
  text-decoration: none;
  color: #fff;
}
#mouse-position {
  left: 15px;
  bottom: 0;
  position: absolute;
}
</style>
