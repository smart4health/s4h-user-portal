// Karma configuration
const webpackConfig = require('./webpack.dev.config.js');

const SUITES = {
    "all":     [ "test/**/*.test.ts" ],
    "medhist": [ "test/transformations/medical-history/ui2fhir/public-api/*.test.ts" ],
    "resolve": [ "test/resolve-codings/concept-resolution.test.ts" ],
    "static":  [ "test/resolve-codings/code-systems/static-resource.test.ts" ],
    "medi":    [ "test/transformations/medications/**/*.test.ts" ],
    "issues":  [ "test/utils/issues.test.ts" ],
    "order":   [ "test/fhir-resources/utils/tau/medication-order.test.ts" ],
    "prob":    [ "test/transformations/problem-list/**/*.test.ts" ]
};

module.exports = function(config) {
    config.set({

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: ".",

        // frameworks to use
        frameworks: [ "chai-spies", "mocha", "chai", "host-environment", "webpack" ],

        // list of files / patterns to load in the browser
        files: SUITES[process.env.SUITE ?? "all"],

        // list of files / patterns to exclude
        exclude: [ ],


        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
            "dist-dev/**/*.js": [ "coverage", "sourcemap" ],
            "test/**/*.ts":     [ "webpack" ]
        },

        webpack: {
            module:   webpackConfig.module,
            resolve:  webpackConfig.resolve,
            mode:     webpackConfig.mode,
            devtool: "inline-source-map"
        },

        reporters: [ "progress", "verbose", "coverage-istanbul", "coverage" ],

        coverageIstanbulReporter: {
            dir: "coverage/%browser%",
            reports: [ "text-summary", "html" ]
        },

        // web server port
        port: 9876,

        // enable / disable colors in the output (reporters and logs)
        colors: true,

        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,

        client: {
            mocha: {
                bail: true,
                global: [ "DUMP" ],
                timeout: 4000
            },
            captureConsole: true
        },


        // enable / disable watching file and executing tests whenever any file changes


        // start these browsers

        browsers: [ process.env.BROWSER ?? "ChromeHeadless" ],

        singleRun: true,
        autoWatch: false,

        // Concurrency level
        // how many browser should be started simultaneous
        concurrency: Infinity
    });
};
