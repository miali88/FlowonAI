const path = require('path');
const webpack = require('webpack');
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");

module.exports = {
  entry: './src/FlowonChatWidget.ts',
  output: {
    filename: 'flowon-chat-widget.js',
    path: path.resolve(__dirname, 'dist'),
    library: {
      type: 'module',
    },
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.mjs'], // Added '.mjs'
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
    fallback: {
      // Specify the exact file paths with extensions
      "process": require.resolve("process/browser.js"),
      "buffer": require.resolve("buffer/index.js"),
    },
    mainFields: ['browser', 'module', 'main'], // Prioritize browser fields
    resolveLoader: {
      fullySpecified: false, // Disable fully specified imports for loaders
    },
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
        test: /\.mjs$/, // Added rule for .mjs files
        include: /node_modules/,
        type: 'javascript/auto',
      },
    ],
  },
  plugins: [
    new NodePolyfillPlugin(),
    new webpack.DefinePlugin({
      'process.env': JSON.stringify(process.env)
    }),
    new webpack.ProvidePlugin({
      process: 'process/browser.js', // Updated with extension
      Buffer: ['buffer', 'Buffer'],
    }),
  ],
  experiments: {
    outputModule: true,
  },
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
};
