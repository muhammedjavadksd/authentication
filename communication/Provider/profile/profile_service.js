"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const amqplib = __importStar(require("amqplib"));
const PROFILE_COMMUNICATION_PROVIDER = {
    authTransferConnection: (queue_name) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const connection = yield amqplib.connect("amqp://localhost");
            const channel = yield connection.createChannel();
            yield channel.assertQueue(queue_name);
            return channel;
        }
        catch (e) {
            return null;
        }
    }),
    authDataTransfer: function (first_name, last_name, email, location, phone_number, user_id, profile_id) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const queueName = (_a = process.env.AUTH_TRANSFER) !== null && _a !== void 0 ? _a : "";
                if (!queueName) {
                    throw new Error("AUTH_TRANSFER environment variable is not set");
                }
                const authTransferConnection = yield this.authTransferConnection(queueName);
                if (authTransferConnection) {
                    const authData = {
                        first_name,
                        last_name,
                        email,
                        location,
                        phone_number,
                        user_id,
                        profile_id
                    };
                    authTransferConnection.sendToQueue(queueName, Buffer.from(JSON.stringify(authData)));
                    console.log("Auth data has been transferred");
                }
                else {
                    console.log("Auth data transfer failed");
                }
            }
            catch (e) {
                console.log("Something went wrong while sending data to auth profile");
                console.error(e);
            }
        });
    }
};
exports.default = PROFILE_COMMUNICATION_PROVIDER;
