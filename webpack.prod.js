const path = require('path');
const webpack = require('webpack');
const { common, env, plugins, rules } = require('./webpack.config');

const config = {
  ...common,
  mode: 'production',
  output: {
    globalObject: 'this',
    filename: '[name].bundle.js',
    chunkFilename: '[name].bundle.js',
    path: path.join(__dirname, './build/production/js'),
  },
  plugins: [
    ...plugins,
    new webpack.ProvidePlugin({
      React: 'react',
    }),
    new webpack.IgnorePlugin({ resourceRegExp: /[^/]+\/[\S]+.prod$/ }),
    new webpack.DefinePlugin({
      'process.env': env,
    }),
  ],
  module: {
    rules: [
      ...rules,
      {
        test: /\.(ts|js)x?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          presets: [
            '@babel/preset-env',
            [
              '@babel/preset-react',
              {
                runtime: 'automatic',
              },
            ],
            '@babel/preset-typescript',
          ],
          plugins: [
            [
              '@babel/plugin-transform-runtime',
              {
                regenerator: true,
              },
            ],
            ['@babel/plugin-proposal-export-default-from'],
            'add-module-exports',
            ['transform-remove-console', { exclude: ['info'] }],
          ],
        },
      },
    ],
  },
};

module.exports = () => {
  return new Promise((resolve, reject) => {
    console.log('[Webpack Build]');
    console.log('-'.repeat(80));

    const compiler = webpack(config);

    compiler.run((err, stats) => {
      if (err) {
        console.error(err.stack || err);
        if (err.details) {
          console.error(err.details);
        }

        reject(err.stack || err.details || err);
      }

      const info = stats.toJson();

      if (stats.hasErrors()) {
        console.error(info.errors);

        reject(info.errors);
      }

      if (stats.hasWarnings()) {
        console.warn(info.warnings);
      }

      resolve();
    });
  });
};
