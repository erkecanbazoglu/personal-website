const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

// By default, webpack only handles JavaScript files.
// To handle other file types, you need to add loaders.
module.exports = {
  mode: "production",
  entry: { bundle: "./js/script.js", style: "./js/style.js" },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "js/[name].[contenthash].js",
  },
  module: {
    rules: [
      {
        // Handles html
        test: /\.html$/i,
        loader: "html-loader",
        options: {
          sources: {
            list: [
              // Handles <img src="...">
              {
                tag: "img",
                attribute: "src",
                type: "src",
              },
              // Add more tags and attributes as needed
            ],
          },
        },
      },
      {
        // Handles css
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
      {
        // Handles images
        test: /\.(png|svg|jpg|jpeg|gif|ico)$/i,
        type: "asset/resource",
        generator: {
          filename: "assets/[hash][ext][query]", // Custom output location for images
        },
      },
    ],
  },
  plugins: [
    // Clean install for the build process
    new CleanWebpackPlugin(),
    // Plugin for html files
    new HtmlWebpackPlugin({
      template: "./src/index.html", // Path to your HTML file
      inject: true,
    }),
    // Plugin for css files
    new MiniCssExtractPlugin({
      filename: "css/[name].[contenthash].css", // Custom output filename
    }),
    // Plugin for copying files that don't need processing
    new CopyWebpackPlugin({
      patterns: [{ from: "./assets/favicon.ico", to: "assets/favicon.ico" }],
    }),
  ],
};
