const path = require('path');
const webpack = require('webpack');

module.exports = {
  mode: 'production',
  entry: {
    service_worker: './src/service_worker.js',
    content_scripts: './src/Content_Scripts/content_scripts.js',
    netflix_subtitles: './src/Content_Scripts/netflix_subtitles.js',
  },
  plugins: [new webpack.ProgressPlugin()],
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
  },
};
