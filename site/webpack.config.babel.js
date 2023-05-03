import HtmlWebpackPlugin from "html-webpack-plugin";

import InjectBodyPlugin from "inject-body-webpack-plugin";

export default {
  mode: "development",
  entry: "./src/p5.js",
  plugins: [
    new HtmlWebpackPlugin({
      templateContent:
        "<html><head><style>html,body { height: 100%;} canvas[resize] { width: 100%; height: 100%; }</style></head><body></body></html>",
    }),
    new InjectBodyPlugin({
      content: "<main></main>",
    }),
  ],
};
