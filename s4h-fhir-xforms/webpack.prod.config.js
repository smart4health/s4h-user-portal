"use strict";

const path = require("path");

module.exports = {
    mode: "production",
    entry: "./src/lib.ts",
    output: {
        path: path.resolve(__dirname, "./dist"),
        publicPath: "/",
        filename: "js/build-[name].js",
        chunkFilename: "js/[name].js",
        libraryTarget: "umd"
    },
    module: {
        rules: [
            {
                enforce: "pre",
                test: /\.ts$/,
                loader: "eslint-loader",
                exclude: /node_modules/
            },
            {
                test: /\.ts$/,
                use:  [{
                    loader: "ts-loader",
                    options: {
                        configFile: "tsconfig.prod.json"
                    }
                }],
                exclude: /node_modules/
            }
        ]
    },

    resolve: {
        extensions: [ ".ts", ".js" ],
        symlinks: false
    },

    devtool: "source-map",

    optimization: {
        minimize: true
    }

};
