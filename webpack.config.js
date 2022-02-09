const path = require("path");

// console.log(path.resolve(__dirname, "assets", "js"));
// console.log(__dirname);
// __dirname은 Javascript가 제공하고 있는 상수 <현재 파일까지의 경로 전체>
module.exports = {
  entry: "./src/client/js/main.js",
  mode: "development",
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "assets", "js"),
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [["@babel/preset-env", { targets: "defaults" }]],
          },
        },
      },
      {
        test: /\.scss$/,
        use: ["styles-loader", "css-loader", "sass-loader"],
      },
    ],
  },
};
