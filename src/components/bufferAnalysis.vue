<template>
  <div id="mapContainer"></div>
  <a-card id="card" title="缓冲区分析">
    <a-row class="cardRow">
      <a-col :span="4">范围：</a-col>
      <a-col :span="12">
        <a-slider
          v-model:value="range"
          :min="1"
          :max="10"
          @change="rangeChanged"
        />
      </a-col>
      <a-col :span="4">
        <a-input-number
          class="inputNum"
          v-model:value="range"
          :min="1"
          :max="10"
        />
      </a-col>
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
import { Geometry, Polygon, MultiPolygon } from "ol/geom";
import GeoJSON from "ol/format/GeoJSON";
import { bbox as bboxStrategy } from "ol/loadingstrategy";
import TileLayer from "ol/layer/Tile";
import TileWMS from "ol/source/TileWMS";
import { click } from "ol/events/condition";
import Overlay from "ol/Overlay";
import { Select } from "ol/interaction";
import { getCenter, buffer } from "ol/extent";
import { Fill, Stroke, Circle, Text, Style } from "ol/style";
import { createStringXY } from "ol/coordinate";
import MousePosition from "ol/control/MousePosition";
import { defaults as defaultControls } from "ol/control";
import { onMounted, onBeforeUnmount, ref } from "vue";
import { flyTo } from "../utils/mapUtil";
import * as turf from "@turf/turf";
import { transform } from "ol/proj";
export default {
  setup() {
    let map: Map;
    let range = ref(1);
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
      let vecSource = new VectorSource({
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
        for (let i = 0; i < features.length; i++) {
          const f = features[i];
          let geo = f.getGeometry();
          if (geo != undefined) {
            flyTo(map, geo.getExtent(), 16, () => {
              //do nothing
              message.success(`已定位${f.getProperties().Name}`);
            });
            // bufferit(f, 20);
            turfBuffer(f);
            break;
          }
        }
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

    function turfBuffer(pointFeature: Feature<Geometry>) {
      let pointGeo = pointFeature.getGeometry();
      if (pointGeo == undefined) return;
      console.log("pointGeo.getType(): ", pointGeo.getType());
      //坐标点转为4326 turf缓冲区只支持4326坐标
      const transPoint = transform(
        getCenter(pointGeo.getExtent()),
        "EPSG:3857",
        "EPSG:4326"
      );
      //创建缓冲数据
      var turfPoint = (turf as any).point(transPoint);
      var buffered = turf.buffer(turfPoint, 0.2, {
        units: "kilometers",
      });

      //创建数据geojson对象和数据源对象
      var format = new GeoJSON();
      var source = new VectorSource();
      //读取geojson数据
      var a = format.readFeature(turfPoint);
      var b = format.readFeature(buffered);
      b.getGeometry().transform("EPSG:4326", "EPSG:3857");
      //将数据添加数据源的
      // source.addFeature(a);
      source.addFeature(b);
      //添加图层
      var test = new VectorLayer({ source: source });
      test.set("name", "缓冲区");
      map.addLayer(test);
    }
    //范围改变事件
    function rangeChanged() {
      message.info(`当前值${range.value}`);
    }
    return {
      range,
      rangeChanged,
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
  color: #fff;
  .cardRow {
    line-height: 40px;
    .inputNum {
      margin-left: 15px;
    }
  }
}
#mouse-position {
  left: 15px;
  bottom: 0;
  position: absolute;
}
</style>
