<template>
  <div class="mainDiv">
    <a-button type="primary" class="btn-Center" @click="start('/map')"
      >多屏对比</a-button
    >
    <a-button type="primary" class="btn-Center" @click="start"
      >路由跳转</a-button
    >
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
