const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  mode: "development",
  entry: "./src/App.bs.js",
  plugins: [
    new HtmlWebpackPlugin({
      templateContent:
        '<html><head></head><body><div id="main"/></body></html>',
    }),
  ],
};
