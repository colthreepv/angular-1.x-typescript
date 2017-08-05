'use strict';
const path = require('path');
const fs = require('fs');
const git = require('git-rev-sync');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const env = process.env.NODE_ENV || 'development';
const isProd = env === 'production';

const ENTRYPOINTS = 'src/entrypoints';

console.log('isProd', isProd);

// webpack is silly and doesn't tell you what is the name of your hashed bundles
function webpackHashInfo () {
  this.plugin('done', function (statsData) {
    const stats = statsData.toJson({
      exclude: [/node_modules/]
    });
    if (stats.errors.length) return;

    const assets = stats.assets.map(asset => asset.name)
      .filter(entry => /(\.js|\.css)$/.test(entry))
      .reduce((hash, current) => {
        if (current.endsWith('.css')) hash.css[current.split('-')[0]] = current;
        if (current.endsWith('.js')) hash.js[current.split('-')[0]] = current;
        return hash;
      }, { js: {}, css: {} });
    /**
     * produces:
     * {
     *   main: 'main-a2bd16cfe8109b14b9bd.js',
     *   login: 'login-5265991d0f2abdccc1bd.js'
     * }
     */

    fs.writeFileSync(path.join(__dirname, 'build', '.bundles.json'), JSON.stringify(assets));
  });
}

const extractSASS = new ExtractTextPlugin({ filename: isProd ? '[name]-[chunkhash].css' : '[name].css' });

const plugins = [
  new webpack.LoaderOptionsPlugin({
    options: {
      sassLoader: {
        includePaths: [path.join(__dirname, 'node_modules')]
      },
      context: '/'
    }
  }),
  new HtmlWebpackPlugin({
    template: './index.html',
    inject: 'body',
    hash: true,
  }),
  // outputs a chunk for all the javascript libraries: angular & co
  new webpack.optimize.CommonsChunkPlugin({
    name: 'vendor',
    chunks: ['vendor', 'login'],
    filename: isProd ? '[name]-[chunkhash].js' : '[name].js'
  }),
  /**
   * extracts all the css code and puts it in the respective file
   * this produces:
   * - style.css: generic CSS used across all applications
   * - login.css: specific CSS used in login
   * - main.css:  specific CSS used in main
   */
  extractSASS,
  // handy to enable/disable development features in the client-side code
  new webpack.DefinePlugin({
    'process.env.NODE_ENV': `"${env}"`,
    'process.env.GIT_REV': `"${git.short()}"`
  })
];

if (isProd) { // add plugins in case we're in production
  plugins.push(webpackHashInfo);
  plugins.push(new CleanWebpackPlugin(['build']));
}

const browserLibs = [
  'angular',
  // 'angular-ui-router'
];

module.exports = {
  devtool: isProd ? 'source-map' : 'inline-source-map',
  entry: {
    // main: path.join(__dirname, ENTRYPOINTS, 'main.js'),
    login: path.join(__dirname, ENTRYPOINTS, 'login.ts'),
    vendor: browserLibs
  },
  output: {
    path: path.join(__dirname, 'build', 'src'),
    filename: isProd ? '[name]-[chunkhash].js' : '[name].js',
    publicPath: '/build/',
  },
  resolve: {
    extensions: ['.ts', '.js', '.json'],
  },
  module: {
    loaders: [
      { test: /\.ts(x?)$/, use: ['babel-loader', 'ts-loader'], exclude: /node_modules/ },
      // es6 code
      // { test: /.js$/, use: ['babel?cacheDirectory'], exclude: /node_modules/ },
      // html included from angular
      { test: /.html$/, use: 'html-loader' },
      // scss - and only scss
      { test: /\.scss$/, use: extractSASS.extract({ fallback: 'style-loader', use: ['css-loader?sourceMap', 'sass-loader?sourceMap'] }) },
      // static assets
      { test: /\.(eot|woff|woff2|ttf|svg|png|jpg)$/, use: 'url-loader?limit=30000&name=[name]-[hash].[ext]' }
    ]
  },
  plugins,
  /**
   * Dev server configuration
   * Reference: http://webpack.github.io/docs/configuration.html#devserver
   * Reference: http://webpack.github.io/docs/webpack-dev-server.html
   */
  devServer: {
    contentBase: 'build',
    // stats: 'minimal',

    // Open resources on the backend server while developing
    // Reference: http://webpack.github.io/docs/webpack-dev-server.html#proxy
    proxy: {
      '/api': {
        target: 'http://localhost:8000'
      }
    }
  }
};
