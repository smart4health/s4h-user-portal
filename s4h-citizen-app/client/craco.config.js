const path = require('path');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { whenDev } = require('@craco/craco');
const dotenv = require('dotenv');

// read client environment variables from the server component and provide craco with the information
// not running in development mode, this would be done by replacing "__ENV_DATA__" with the configuration object

const sassPathsToInclude = () => {
  const contentDirectory = path.join(__dirname, 'src', 'css');
  return [`${contentDirectory}/_variables.scss`, `${contentDirectory}/_mixins.scss`];
};

whenDev(() => {
  dotenv.config({
    path: path.join(__dirname, '/../.env'),
  });
  const { parseEnv, parseClientEnv } = require('../server/env');
  const env = parseEnv();
  const clientEnv = parseClientEnv(env);
  for (const envVar in clientEnv) {
    if (envVar.startsWith('REACT_APP') && clientEnv[envVar]) {
      process.env[envVar] = clientEnv[envVar];
    }
  }
});

module.exports = () => ({
  style: {
    ...whenDev(() => ({
      css: {
        loaderOptions: (cssLoaderOptions, { env, paths }) => {
          cssLoaderOptions.sourceMap = true;
          return cssLoaderOptions;
        },
      },
      sass: {
        loaderOptions: (sassLoaderOptions, { env, paths }) => {
          sassLoaderOptions.sourceMap = true;
          return sassLoaderOptions;
        },
      },
    })),
  },
  webpack: {
    mode: 'extends',
    plugins: {
      add: [
        [
          new NodePolyfillPlugin({
            excludeAliases: ['console'],
          }),
          'prepend',
        ],
      ],
    },
    configure: (webpackConfig, { env }) => {
      webpackConfig.resolve.fallback = {
        crypto: require.resolve('crypto-browserify'),
      };
      let indexOfCssRule = null;
      // The webpack config from react-scripts@5.0.0 differs on
      // which rules object to access based on the mode in which it runs.
      // ie production(during build) or development(in machine)
      webpackConfig.module.rules[env === 'production' ? 0 : 1].oneOf.forEach(
        (rule, index) => {
          const ruleTest = rule.test;
          if (
            ruleTest &&
            ruleTest.source &&
            ruleTest.source.includes('scss|sass') &&
            !ruleTest.source.includes('module')
          ) {
            indexOfCssRule = index;
          }
        }
      );
      const sassResourcesLoader = {
        loader: 'sass-resources-loader',
        options: {
          resources: sassPathsToInclude(),
        },
      };
      webpackConfig.module.rules[env === 'production' ? 0 : 1].oneOf[
        indexOfCssRule
      ].use.push(sassResourcesLoader);

      if (env === 'production') {
        const instanceOfMiniCssExtractPlugin = webpackConfig.plugins.find(
          plugin => plugin instanceof MiniCssExtractPlugin
        );

        instanceOfMiniCssExtractPlugin.options.ignoreOrder = true;
      }
      
      return webpackConfig;
    },
  },
  devServer: (devServerConfig, { env, paths, proxy, allowedHost }) => {
    devServerConfig.server = {
      type: 'https',
      options: {
        key: devServerConfig.https.key,
        cert: devServerConfig.https.cert,
      },
    };
    devServerConfig.https = undefined;
    return devServerConfig;
  },
});
