"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const E = __importStar(require("fp-ts/Either"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const mkdirp = __importStar(require("mkdirp"));
const js_yaml_1 = __importDefault(require("js-yaml"));
const yargs_1 = __importDefault(require("yargs"));
const helpers_1 = require("yargs/helpers");
const recipe_1 = require("./recipe");
const patient_1 = require("./samplers/patient");
const tsv_1 = require("./serializers/tsv");
const fhir_1 = require("./serializers/fhir");
const console_1 = require("./serializers/console");
const argv = yargs_1.default(helpers_1.hideBin(process.argv))
    .option("n", {
    alias: "number", type: "number", default: 10,
    describe: "number of patients to sample"
})
    .option("o", {
    alias: "out", type: "string", default: "./data/demo",
    describe: "path to write sampled patients to"
})
    .option("r", {
    alias: "recipe", type: "string", default: "./recipes/default.recipe.yaml",
    describe: "configuration recipe"
})
    .argv;
const recipe = recipe_1.Recipe_T.decode(js_yaml_1.default.load(fs.readFileSync(path.resolve(process.cwd(), argv.recipe), "utf8")));
if (E.isLeft(recipe)) {
    console.error("malformed recipe");
    console.dir(recipe.left, { depth: 5 });
    process.exit(1);
}
const dataRootDir = path.resolve(process.cwd(), argv.out);
mkdirp.sync(dataRootDir);
const fhir = new fhir_1.FhirSerializer();
const tabs = new tsv_1.TsvSerializer();
const cons = new console_1.ConsoleSerializer();
fhir.init(dataRootDir, recipe.right);
tabs.init(dataRootDir, recipe.right);
cons.init(dataRootDir, recipe.right);
for (let i = 0; i < argv.number; i++) {
    const patient = patient_1.samplePatient(recipe.right);
    cons.serializePatient(patient);
    tabs.serializePatient(patient);
    fhir.serializePatient(patient);
}
fhir.done();
tabs.done();
cons.done();
