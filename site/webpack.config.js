const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  mode: "development",
  entry: "./src/p5.js",
  output: {
    publicPath: "/",
  },
  plugins: [
    new HtmlWebpackPlugin({
      templateContent:
        '<html><head></head><body><div id="main"/></body></html>',
    }),
  ],
  devServer: {
    historyApiFallback: {
      rewrites: [{ from: /^\/origami\/.*$/, to: "/index.html" }],
    },
  },
};
