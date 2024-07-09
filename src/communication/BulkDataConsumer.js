"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = bulkConsumer;
// const ProfielDataConsumer = require("./Consumer/ProfileDataConsumer")
const ProfileDataConsumer_1 = __importDefault(require("./Consumer/ProfileDataConsumer"));
function bulkConsumer() {
    ProfileDataConsumer_1.default.authProfileUpdation();
}
