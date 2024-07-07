"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
function authenticationDbConnection() {
    console.log(process.env.MONGO_DEV_URL);
    mongoose_1.default.connect(process.env.MONGO_DEV_URL, { useNewUrlParser: true })
        .then(() => {
        console.log("Authentication database has been connected");
    })
        .catch((err) => {
        console.log(err);
        console.log("Authentication database has been failed");
    });
}
exports.default = authenticationDbConnection;
