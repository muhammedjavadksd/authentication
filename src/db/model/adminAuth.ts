// const { default: mongoose } = require("mongoose");
import mongoose from "mongoose";
import IAdminAuthModel from "../../config/Datas/Interface/IModel/IAdminAuthModel";

const AdminAuth: mongoose.Schema = new mongoose.Schema({
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

const AdminAuthModel = mongoose.model<IAdminAuthModel>("admin", AdminAuth, "admin");
export default AdminAuthModel