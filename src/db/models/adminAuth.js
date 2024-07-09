"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// const { default: mongoose } = require("mongoose");
const mongoose_1 = __importDefault(require("mongoose"));
let AdminAuth = new mongoose_1.default.Schema({
    name: {
        required: true,
        type: String
    },
    email_address: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true
    },
    last_logged: {
        type: Date,
        required: true
    },
    token: {
        type: String,
        required: false
    }
});
let AdminAuthModel = mongoose_1.default.model("admin", AdminAuth, "admin");
exports.default = AdminAuthModel;
