const AntdMomentWebpackPlugin = require('@ant-design/moment-webpack-plugin');

const { theme } = require('antd/lib');
const { convertLegacyToken } = require('@ant-design/compatible/lib');

const { defaultAlgorithm, defaultSeed } = theme;

const mapToken = defaultAlgorithm(defaultSeed);
const v4Token = convertLegacyToken(mapToken);

module.exports = {
  eslint: {
    enable: false,
  },
  plugins: [
    {
      // eslint-disable-next-line global-require, unicorn/prefer-module
      plugin: require('craco-less'),
      options: {
        noIeCompat: true,
        lessLoaderOptions: {
          lessOptions: {
            modifyVars: v4Token,
          },
        },
      },
    },
  ],
  webpack: {
    plugins: {
      add: [new AntdMomentWebpackPlugin()],
    },
  },
};
