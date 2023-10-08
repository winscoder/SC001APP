// #ifndef VUE3
import Vue from 'vue'
import App from './App'
import store from "@/store/index.js"

import '@/static/css/font.css';
import '@/static/css/custom-uni.css';
import "@/hooks/showMsg.js"

Vue.config.productionTip = false

App.mpType = 'app'

const app = new Vue({
  store,
  ...App
})
app.$mount()
// #endif

// #ifdef VUE3
import {
  createSSRApp
} from 'vue'
import App from './App.vue'
export function createApp() {
  const app = createSSRApp(App)
  return {
    app
  }
}
// #endif
