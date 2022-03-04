<template>
  <div class="main">
    <a-button type="primary" class="btn-Center" @click="start('/map')"
      >多屏对比
    </a-button>
    <a-button type="primary" class="btn-Center" @click="start('/tiandi')"
      >天地图
    </a-button>
    <a-button type="primary" class="btn-Center" @click="start('/wmsmap')"
      >WFS属性查询/要素搜索
    </a-button>
    <a-button type="primary" class="btn-Center" @click="start('/tiffmap')"
      >GeoTIFF
    </a-button>
  </div>
</template>
<script lang="ts">
// 定义一个组件
import { defineComponent } from "vue";
import { useRouter } from "vue-router";

export default defineComponent({
  name: "Start",
  props: {},
  components: {},
  setup(props, ctx) {
    //router是全局路由对象，route= userRoute()是当前路由对象
    let router = useRouter();
    let start = (path) => {
      router.push({ path: path });
    };
    return {
      start,
    };
  },
});
</script>
<style scoped lang="less">
.main {
  text-align: center; /*让div内部文字居中*/
  background-color: #fff;
  border-radius: 20px;
  width: 100%;
  height: 50px;
  margin: auto;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;

  .btn-Center {
    margin-left: 15px;
  }
}

.mainDiv {
  height: 100%;
  width: 100%;
  display: -webkit-flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;

  .btn-Center {
    margin-left: 10px;
  }
}
</style>
