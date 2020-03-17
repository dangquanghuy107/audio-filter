<template>
  <v-app>
    <router-view></router-view>
    <v-content>
      <!-- <Home/> -->
    </v-content>
  </v-app>
</template>

<script>
// import Home from './components/Home';

export default {
  name: 'App',

  components: {
    // Home,
    // Demo
  },

  data: () => ({
    //
  }),
};
</script>

<style src="@/css/styles.css"> </style>

<style>
  #app{
    text-align: center;
  }
</style>