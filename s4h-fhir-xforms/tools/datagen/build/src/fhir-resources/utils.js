"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.randomId = void 0;
const uuid_1 = require("../utils/uuid");
function randomId() {
    return {
        system: "random-id",
        value: uuid_1.uuidv4()
    };
}
exports.randomId = randomId;
