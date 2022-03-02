import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import Antd from "ant-design-vue";
import "ant-design-vue/dist/antd.css";
import Axios from "axios";

const app = createApp(App);
app.use(Antd);
app.use(store).use(router).mount("#app");

app.config.globalProperties.axios = Axios;
// Axios.defaults.baseURL = "/api";

//设置路由标题
router.beforeEach((to, from, next) => {
  /* 路由发生变化修改页面title */
  if (to.meta.title) {
    document.title = to.meta.title as string;
  }
  next();
});
