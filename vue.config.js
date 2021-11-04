const path = require('path')
const iconsPath = path.resolve('./src/assets/icons')

module.exports = {
  chainWebpack: config => {
    // svgicon
    config.module
      .rule('vue-svgicon')
      .include.add(iconsPath)
      .end()
      .test(/\.svg$/)
      .use('svgicon')
      .loader('@yzfe/svgicon-loader')
      .options({
        iconsPath,
        svgoConfig: {}
      })

    config.module.rule('svg').exclude.add(iconsPath).end()

    config.module
      .rule('vue')
      .use('vue-loader')
      .loader('vue-loader')
      .tap((opt) => {
        opt.transformAssetUrls = opt.transformAssetUrls || {
          icon: ['data'],
          video: ['src', 'poster'],
          source: 'src',
          img: 'src',
          image: ['xlink:href', 'href'],
          use: ['xlink:href', 'href']
        }
        return opt
      })

    // Aliases
    config.resolve.alias.set('@icon', iconsPath)
  }
}
