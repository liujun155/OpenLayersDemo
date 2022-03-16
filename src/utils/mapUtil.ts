import { Map } from "ol";
import BaseLayer from "ol/layer/Base";
/**
 * @description 飞行到某点位
 * @author LiuJun
 * @date 12/08/2021
 * @param {*} location 点位
 * @param {*} zoomLevel 缩放等级
 * @param {*} done 定位完成后回调事件
 * @memberof MyOL
 */
export function flyTo(map: Map, location: number[], zoomLevel: number, done) {
  const view = map.getView();
  const duration = 2000;
  const zoom = view.getZoom();
  let parts = 2; // 判断下列两个动画效果是否都执行完毕
  let called = false;

  function callback(complete) {
    --parts;
    if (called) {
      return;
    }
    if (parts === 0 || !complete) {
      //动画效果完成 或 动画效果中断 complete是内部传入参数，判断动画执行还是中断
      called = true;
      done(complete); //动画效果完后执行的函数
    }
  }
  //第一个动画效果 到达目的点
  //第二个动画效果 执行放大缩小
  //两个动画换位，则两个先放大缩小，在转到目的点
  view.animate(
    {
      center: location,
      duration: duration,
    },
    callback
  );
  view.animate(
    {
      zoom: (zoom as number) - 1,
      duration: duration / 2,
    },
    {
      zoom: zoomLevel,
      duration: duration / 2,
    },
    callback
  );
}

/**
 * 根据图层名称查找图层
 * @param map 地图
 * @param layerName 图层名称
 * @returns 图层
 */
export function getLayerByName(
  map: Map,
  layerName: string
): BaseLayer | undefined {
  if (layerName == "") return undefined;
  let layer;
  const layers = map.getLayers().getArray();
  if (layers != undefined && layers.length > 0) {
    for (let i = 0; i < layers.length; i++) {
      if (layers[i].get("name") == layerName) {
        layer = layers[i];
        break;
      }
    }
  }
  return layer;
}
