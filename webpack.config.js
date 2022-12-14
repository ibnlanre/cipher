import path from "node:path";

import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDevelopment = process.env.NODE_ENV == "development";

/** @type { import('webpack').Configuration } */
export default {
  mode: isDevelopment || "production",
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
  },
  plugins: [],
  optimization: {
    mangleExports: false,
    minimize: false,
    nodeEnv: "production",
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
    },
    // alias: { crypto: require.resolve("crypto-browserify") },
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
