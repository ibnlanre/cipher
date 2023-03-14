import path from "node:path";
import webpack from "webpack";
import TerserPlugin from "terser-webpack-plugin";

import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDevelopment = process.env.NODE_ENV == "development";

/** @type { import('webpack').Configuration } */
export default {
  mode: isDevelopment ? "development" : "production",
  entry: "./src/index.ts",
  devtool: false, //"inline-source-map",
  // output: {
  //   library: "Cipher",
  //   libraryTarget: "umd",
  //   path: path.resolve(__dirname, "dist"),
  //   globalObject: "this",
  //   filename: "index.js",
  // },
  output: {
    filename: "index.js",
    path: path.resolve(__dirname, "dist"),
    libraryTarget: "module",
    globalObject: "this",
    chunkFormat: "module",
  },
  target: "web",
  plugins: [
    new webpack.ProvidePlugin({
      process: "process/browser",
      Buffer: ["buffer", "Buffer"],
    }),
  ],
  optimization: {
    mangleExports: false,
    minimize: false,
    nodeEnv: "production",
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          mangle: {
            properties: {
              regex: /^_/,
            },
          },
        },
      }),
    ],
  },
  module: {
    rules: [
      {
        test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
        type: "asset",
      },
      {
        test: /\.([cm]?ts|tsx)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-env", "@babel/preset-typescript"],
              plugins: ["@babel/plugin-transform-runtime"],
            },
          },
          {
            loader: "ts-loader",
          },
        ],
      },
      {
        test: /\.js$/,
        use: ["source-map-loader"],
        enforce: "pre",
      },
    ],
  },
  resolve: {
    fallback: {
      stream: require.resolve("stream-browserify"),
      crypto: require.resolve("crypto-browserify"),
      assert: require.resolve("assert"),
      http: require.resolve("stream-http"),
      https: require.resolve("https-browserify"),
      os: require.resolve("os-browserify"),
      url: require.resolve("url"),
    },
    extensions: [".ts", ".tsx", ".js", ".json"],
    extensionAlias: {
      ".js": [".js", ".ts"],
      ".cjs": [".cjs", ".cts"],
      ".mjs": [".mjs", ".mts"],
    },
  },
  experiments: {
    outputModule: true,
  },
};
