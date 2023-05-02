// /* eslint-disable no-console */
require('dotenv').config();
/* eslint-disable no-console */
require('dotenv-vault-core').config();
console.log(process.env.FIRECAMP_API_HOST, 'FIRECAMP_API_HOST'); // for debugging purposes. remove when ready.

const webpack = require('webpack');
const path = require('path');
// eslint-disable-next-line import/no-extraneous-dependencies
// const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { Environment } = require('./scripts/constants');

const env = process.env.NODE_ENV;

const metadata = require('./package.json');

exports.common = {
  entry: {
    index: path.join(
      __dirname,
      './platform/firecamp-platform/src/containers/index.tsx'
    ),
    identity: path.join(
      __dirname,
      './platform/firecamp-platform/src/containers/identity.tsx'
    ),
  },
  optimization: {
    nodeEnv: process.env.NODE_ENV,
    minimize: true,
    runtimeChunk: 'single',
    splitChunks: {
      // name: 'vendor',
      // chunks(chunk) {
      //   // To prevent generate separate chunk for background script
      //   // Because all node_modules not needed in background script
      //   return !chunk?.name?.includes('background');
      // },
      chunks: 'all',
      maxInitialRequests: Infinity,
      minSize: 0,
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name(module) {
            return 'vender';

            // get the name. E.g. node_modules/packageName/not/this/part.js
            // or node_modules/packageName
            // const packageName = module.context.match(
            //   /[\\/]node_modules[\\/](.*?)([\\/]|$)/
            // )[1];

            // // npm package names are URL-safe, but some servers don't like @ symbols
            // return `npm.${packageName.replace('@', '')}`;
          },
        },
      },
    },
  },
  resolve: {
    extensions: ['*', '.mjs', '.js', '.json', '.jsx', '.ts', '.tsx', '.svg'],
    alias: {
      // faker: path.resolve('./node_modules/faker'),
      react: path.resolve('./node_modules/react'),
      'react-dom': path.resolve('./node_modules/react-dom'),
      lodash: path.resolve('./node_modules/lodash'),
      nanoid: path.resolve('./node_modules/nanoid'),
      'awesome-notifications': path.resolve(
        './node_modules/awesome-notifications'
      ),
      '@babel/runtime': path.resolve('./node_modules/@babel/runtime'),
      'monaco-editor': path.resolve('./node_modules/monaco-editor'),
    },
    fallback: {
      fs: false,
    },
  },
};

const outputPath = `${__dirname}/build/${env}`;
const publicPath = '';
exports.output = {
  globalObject: 'this',
  filename: '[name].bundle.js',
  chunkFilename: '[name].bundle.js',
  path: outputPath,
  publicPath,
};

// exports.output.path = path.join(__dirname, `./build/${env}`);
if (env === Environment.Development) exports.output.clean = true;

exports.env = {
  NODE_ENV: JSON.stringify(process.env.NODE_ENV),
  FIRECAMP_API_HOST: JSON.stringify(process.env.FIRECAMP_API_HOST),
  FIRECAMP_CLOUD_AGENT: JSON.stringify(process.env.FIRECAMP_CLOUD_AGENT),
  FIRECAMP_EXTENSION_AGENT_ID: JSON.stringify(
    process.env.FIRECAMP_EXTENSION_AGENT_ID
  ),
  APP_VERSION: JSON.stringify(metadata.version),
  AppFormat: JSON.stringify(process.env.AppFormat),
  SENTRY_DSN: JSON.stringify(process.env.SENTRY_DSN),
  CRISP_WEBSITE_ID: JSON.stringify(process.env.CRISP_WEBSITE_ID),
  GOOGLE_OAUTH2_CLIENT_ID: JSON.stringify(process.env.GOOGLE_OAUTH2_CLIENT_ID),
  GOOGLE_OAUTH2_REDIRECT_URI: JSON.stringify(
    process.env.GOOGLE_OAUTH2_REDIRECT_URI
  ),
  GITHUB_OAUTH2_CLIENT_ID: JSON.stringify(process.env.GITHUB_OAUTH2_CLIENT_ID),
  GITHUB_OAUTH2_REDIRECT_URI: JSON.stringify(
    process.env.GITHUB_OAUTH2_REDIRECT_URI
  ),
  GOOGLE_ANALYTICS_CHROME_ID: JSON.stringify(
    process.env.GOOGLE_ANALYTICS_CHROME_ID
  ),
  GOOGLE_ANALYTICS_ELECTRON_ID: JSON.stringify(
    process.env.GOOGLE_ANALYTICS_ELECTRON_ID
  ),
};

exports.plugins = [
  new HtmlWebpackPlugin({
    inject: true,
    chunks: ['index'],
    filename: 'index.html',
    template: 'templates/index.html',
  }),
  new HtmlWebpackPlugin({
    inject: true,
    chunks: ['identity'],
    filename: 'identity.html',
    template: 'templates/identity.html',
  }),
  new NodePolyfillPlugin(),
  new webpack.ProgressPlugin({
    entries: true,
    modules: true,
    modulesCount: 100,
    profile: true,
    handler: (percentage, message, ...args) => {
      console.clear();
      console.log(`${(percentage * 100).toFixed()}%`, message, ...args);
    },
  }),
  // new MonacoWebpackPlugin({
  //   /**
  //    * available options are documented at
  //    * https://github.com/microsoft/monaco-editor/tree/main/webpack-plugin#options
  //    **/
  //   globalAPI: true,
  //   publicPath: '/js',
  //   filename: '[name].worker.bundle.js',
  //   languages: ['javascript', 'html', 'typescript', 'json'],
  // }),
];

exports.rules = [
  { test: /\.flow$/, loader: 'ignore-loader' },
  {
    test: /\.css$/,
    use: [
      'style-loader', // creates style nodes = require( JS strings
      'css-loader', // translates CSS into CommonJS
    ],
  },
  {
    test: /\.s[ac]ss$/i,
    use: [
      'style-loader', // creates style nodes = require( JS strings
      'css-loader', // translates CSS into CommonJS
      'sass-loader', // compiles Sass to CSS
    ],
  },
  {
    resourceQuery: /raw/,
    type: 'asset/source',
  },
  {
    test: /\.(woff|woff2|eot|ttf|otf)$/i,
    type: 'asset/resource',
  },
  {
    test: /\.(png|svg|jpg|jpeg|gif)$/i,
    type: 'asset/resource',
  },
];
