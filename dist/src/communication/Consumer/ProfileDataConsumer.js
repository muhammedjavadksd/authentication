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
const amqplib_1 = __importDefault(require("amqplib"));
const UserAuthentication_1 = __importDefault(require("../../repositories/UserAuthentication"));
const mongoose_1 = __importDefault(require("mongoose"));
class ProfileDataConsumer {
    constructor() {
        this.connection = null;
        this.channel = null;
        this.Queue = process.env.AUTH_DATA_UPDATE_QUEUE;
    }
    _init_() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.connection = yield amqplib_1.default.connect("amqp://localhost");
                this.channel = yield this.connection.createChannel();
                this.channel.assertQueue(this.Queue, { durable: true });
            }
            catch (e) { }
        });
    }
    authProfileUpdation() {
        var _a;
        try {
            (_a = this.channel) === null || _a === void 0 ? void 0 : _a.consume(this.Queue, (msg) => __awaiter(this, void 0, void 0, function* () {
                if (msg) {
                    const messageContent = JSON.parse(msg.content.toString());
                    console.log(messageContent);
                    const profile_id = messageContent.profile_id;
                    if (profile_id) {
                        const userRepo = new UserAuthentication_1.default();
                        yield userRepo.updateUserById(new mongoose_1.default.Types.ObjectId(profile_id), messageContent.edit_details);
                        console.log("Authentication data has been updated ");
                    }
                }
            }), { noAck: true });
        }
        catch (e) { }
    }
}
exports.default = ProfileDataConsumer;
