const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin') // minify html
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin') //allows to append js auto with attr
const FixStyleOnlyEntriesPlugin = require('webpack-fix-style-only-entries') //fix an duplication problem (see docs)
const MiniCssExtractPlugin = require('mini-css-extract-plugin') //extract css (and uses 'css-loader')
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin') //minify css

module.exports = {
  entry: {
    main: path.join(__dirname, 'src/app.js'),
    styles: ['./src/styles.css'],
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.js/,
        exclude: /(node_modules|bower_components)/,
        use: [
          {
            loader: 'babel-loader',
          },
        ],
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Custom template',
      template: path.join(__dirname, 'src/index.template.html'),
    }),
    new ScriptExtHtmlWebpackPlugin({
      defaultAttribute: 'defer', //auto append the generated js and add 'defer' attribute.
    }),
    new MiniCssExtractPlugin({ filename: '[name].css' }), //css output file name
    new FixStyleOnlyEntriesPlugin(),
    new OptimizeCssAssetsPlugin({}),
  ],
  stats: {
    colors: true,
  },

  devtool: 'source-map',

  mode: 'development', //! options: 'development', 'production'
  devServer: {
    contentBase: './dist',
    inline: true,
    port: 3000,
  },
}
