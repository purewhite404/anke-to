// vue.config.js
module.exports = {
  css: {
    loaderOptions: {
      // pass options to sass-loader
      sass: {
        // import `src/style/_main.scss` to all components
        additionalData: `@import "~@/style/_main.scss";`
      }
    }
  },
  devServer: {
    proxy: {
      '/api/*': {
        target: 'http://localhost:1323',
        changeOrigin: true
      }
    }
  },
  configureWebpack: {
    resolve: {
      alias: {
        vue$: 'vue/dist/vue.esm.js'
      }
    }
  }
}
