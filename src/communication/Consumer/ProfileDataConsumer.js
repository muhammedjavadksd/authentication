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
class ProfileDataConsumer {
    constructor() {
        this.connection = null;
        this.channel = null;
        this.Queue = process.env.AUTH_DATA_UPDATE_QUEUE;
    }
    _init_() {
        return __awaiter(this, void 0, void 0, function* () {
            this.connection = yield amqplib_1.default.connect("amqp://localhost");
            this.channel = yield this.connection.createChannel();
        });
    }
    authProfileUpdation() {
        var _a;
        (_a = this.channel) === null || _a === void 0 ? void 0 : _a.consume(this.Queue, (msg) => __awaiter(this, void 0, void 0, function* () {
            if (msg) {
                const messageContent = JSON.parse(msg.content.toString());
                console.log(messageContent);
                const profile_id = messageContent.profile_id;
                if (profile_id) {
                    yield authHelper.updateUserProfile(messageContent.edit_details, profile_id);
                    console.log("Authentication data has been updated ");
                }
            }
        }), { noAck: true });
    }
}
// let ProfielDataConsumer: ProfielDataConsumerInterface = {
//     _getChannel: async (queue_name: string): Promise<amqplib.Channel | null> => {
//         try {
//             const connection: Connection = await amqplib.connect("amqp://localhost");
//             const channel: Channel = await connection.createChannel()
//             await channel.assertQueue(queue_name, { durable: true });
//             return channel
//         } catch (e) {
//             return null;
//         }
//     },
//     authProfileUpdation: async function (): Promise<void> {
//         const queueName: string = process.env.AUTH_DATA_UPDATE_QUEUE!;
//         const channel: Channel | null = await this._getChannel(queueName);
//         if (channel) {
//             channel.consume(queueName, async (msg) => {
//                 if (msg) {
//                     console.log("This msg");
//                     const messageContent = JSON.parse(msg.content.toString());
//                     console.log("Update profile content is :");
//                     console.log(messageContent);
//                     const profile_id: string = messageContent.profile_id;
//                     if (profile_id) {
//                         await authHelper.updateUserProfile(messageContent.edit_details, profile_id)
//                         console.log("Authentication data has been updated ");
//                     }
//                 }
//             }, { noAck: true })
//         }
//     }
// }
// module.exports = ProfielDataConsumer;
exports.default = ProfileDataConsumer;
