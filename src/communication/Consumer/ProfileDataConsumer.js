"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// let amqplib = require("amqplib");
const amqplib_1 = __importDefault(require("amqplib"));
const authHelper = require("../../helper/authUserHelper");
let ProfielDataConsumer = {
    _getChannel: (queue_name) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            let connection = yield amqplib_1.default.connect("amqp://localhost");
            let channel = yield connection.createChannel();
            yield channel.assertQueue(queue_name, { durable: true });
            return channel;
        }
        catch (e) {
            return null;
        }
    }),
    authProfileUpdation: function () {
        return __awaiter(this, void 0, void 0, function* () {
            const queueName = process.env.AUTH_DATA_UPDATE_QUEUE;
            const channel = yield this._getChannel(queueName);
            if (channel) {
                channel.consume(queueName, (msg) => __awaiter(this, void 0, void 0, function* () {
                    if (msg) {
                        console.log("This msg");
                        let messageContent = JSON.parse(msg.content.toString());
                        console.log("Update profile content is :");
                        console.log(messageContent);
                        const profile_id = messageContent.profile_id;
                        if (profile_id) {
                            yield authHelper.updateUserProfile(messageContent.edit_details, profile_id);
                            console.log("Authentication data has been updated ");
                        }
                    }
                }), { noAck: true });
            }
        });
    }
};
// module.exports = ProfielDataConsumer;
exports.default = ProfielDataConsumer;
