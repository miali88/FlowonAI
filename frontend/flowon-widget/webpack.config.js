const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  entry: './src/FlowonChatWidget.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'flowon-chat-widget.js',
    library: {
      name: 'FlowonChatWidget',
      type: 'umd',
      umdNamedDefine: true,
    },
    clean: true, // Optional: Cleans the output directory before emit
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.mjs'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
      'process/browser': 'process/browser.js',
    },
    fallback: {
      "process": require.resolve("process/browser.js"),
      "buffer": require.resolve("buffer/index.js"),
    },
    mainFields: ['browser', 'module', 'main'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: {
                localIdentName: '[name]__[local]___[hash:base64:5]',
              },
              importLoaders: 1,
            },
          },
          'postcss-loader',
        ],
      },
      {
        test: /\.mjs$/,
        include: /node_modules/,
        type: 'javascript/auto',
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new NodePolyfillPlugin(),
    new webpack.DefinePlugin({
      'process.env': JSON.stringify(process.env)
    }),
    new webpack.ProvidePlugin({
      process: 'process/browser.js',
      Buffer: ['buffer', 'Buffer'],
    }),
    new webpack.DefinePlugin({
      'process.env.NEXT_PUBLIC_API_BASE_URL': JSON.stringify(process.env.NEXT_PUBLIC_API_BASE_URL || 'https://71efb9730013.ngrok.app/api/v1'),
    }),
  ],
  // Removed experiments section
  ignoreWarnings: [
    {
      module: /@livekit\/components-react/,
      message: /Can't resolve 'process\/browser'/,
    },
    {
      module: /livekit-client/,
      message: /Can't resolve 'process\/browser'/,
    },
  ],
  devtool: 'source-map',
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin({
      terserOptions: {
        ecma: 2015, // Specify ECMAScript target version
        compress: {
          drop_console: true, // Example: remove console logs
        },
      },
    })],
  },
};
