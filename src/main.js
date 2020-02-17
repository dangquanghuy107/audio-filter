import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify';

import AudioVisual from 'vue-audio-visual'

Vue.config.productionTip = false
Vue.use(AudioVisual)

new Vue({
  vuetify,
  render: h => h(App)
}).$mount('#app')
