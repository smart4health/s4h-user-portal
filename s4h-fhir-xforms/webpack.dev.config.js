"use strict";

const path = require("path");

module.exports = {
    mode: "development",
    watch: false,
    entry: "./src/lib.ts",
    output: {
        path: path.resolve(__dirname, "./dist-dev"),
        publicPath: "/",
        filename: "js/build-[name].js",
        chunkFilename: "js/[name].js",
        libraryTarget: "umd"
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use:  [{
                    loader: "ts-loader",
                    options: {
                        configFile: "tsconfig.dev.json"
                    }
                }],
                exclude: /node_modules/
            },
            {
                enforce: "post",
                test: /\.(js|ts)$/,
                use:  {
                    loader: 'istanbul-instrumenter-loader',
                    options: {
                        esModules: true
                    }
                },
                exclude: [
                  /\.(e2e|spec)\.ts$/,
                  /node_modules/
                ]
            }
        ]
    },

    plugins: [
    ],

    resolve: {
        extensions: [ ".ts", ".js" ],
        symlinks: false
    },
    devtool: "inline-source-map",

    optimization: {
        minimize: false
    },
    watchOptions: {
        poll: true,
        ignored: /node_modules/
    }

};
