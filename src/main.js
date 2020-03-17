import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify';

import AudioVisual from 'vue-audio-visual'
import VueRouter from 'vue-router'
import router from './router'

Vue.config.productionTip = false
Vue.use(AudioVisual)
Vue.use(VueRouter)

new Vue({
  render: h => h(App),
  vuetify,
  router,
}).$mount('#app')
