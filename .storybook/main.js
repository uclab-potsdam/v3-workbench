const path = require('path');

module.exports = {
  "stories": [
    "../src/**/*.stories.mdx",
    "../src/**/*.stories.@(js|jsx|ts|tsx)"
  ],
  "addons": [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/preset-scss",
    'storybook-design-token'
  ],
  webpackFinal: async (config, { configType }) => {
    iconPath = path.resolve(__dirname, '../src/assets/icons')
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": path.resolve(__dirname, "../src"),
      '@icon': iconPath
    }

    config.module.rules.filter(rule => rule.test?.source.match(/svg/)).forEach(rule => {
      rule.exclude = [...(rule.exclude || []), iconPath]
    })

    

    config.module.rules.push({
      test: /\.svg$/,
      include: [
        iconPath
      ],
      use: [
        {
          loader: '@yzfe/svgicon-loader',
          options: {
            iconsPath: iconPath,
            svgoConfig: {}
          }
        }
      ]
    })

    config.module.rules.filter(rule => rule.test?.source.match(/vue/) && rule.loader?.match(/vue-loader/)).forEach(rule => {
      rule.options = { ...rule.options, transformAssetUrls: {
        icon: [
          'data'
        ]
      }}
    })

    return config
  }
}