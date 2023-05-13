import HtmlWebpackPlugin from "html-webpack-plugin";

export default {
  mode: "development",
  entry: "./src/index.js",
  plugins: [
    new HtmlWebpackPlugin({
      templateContent:
        '<html><head></head><body><div id="main"/></body></html>',
    }),
  ],
};
