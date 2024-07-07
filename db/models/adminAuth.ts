// const { default: mongoose } = require("mongoose");
import mongoose from "mongoose";

let AdminAuth: mongoose.Schema = new mongoose.Schema({
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
})

let AdminAuthModel = mongoose.model("admin", AdminAuth, "admin");
export default AdminAuthModel