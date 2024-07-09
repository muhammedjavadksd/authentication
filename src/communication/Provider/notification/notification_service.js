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
class AuthNotificationProvider {
    constructor() {
        this.connection = null;
        this.channel = null;
        this.NOTIFICATION_QUEUE = process.env.USER_SIGN_IN_NOTIFICATION;
    }
    _init_() {
        return __awaiter(this, void 0, void 0, function* () {
            this.connection = yield amqplib.connect("amqp://localhost");
            this.channel = yield this.connection.createChannel();
        });
    }
    signInOTPSender(data) {
        var _a;
        try {
            (_a = this.channel) === null || _a === void 0 ? void 0 : _a.sendToQueue(this.NOTIFICATION_QUEUE, Buffer.from(JSON.stringify(data)));
            return true;
        }
        catch (e) {
            console.log(e);
            return false;
        }
    }
    signUpOTPSender(data) {
        var _a;
        try {
            (_a = this.channel) === null || _a === void 0 ? void 0 : _a.sendToQueue(this.NOTIFICATION_QUEUE, Buffer.from(JSON.stringify(data)));
            return true;
        }
        catch (e) {
            return false;
        }
    }
    adminForgetPasswordEmail(data) {
        var _a;
        try {
            (_a = this.channel) === null || _a === void 0 ? void 0 : _a.sendToQueue(this.NOTIFICATION_QUEUE, Buffer.from(JSON.stringify(data)));
            return true;
        }
        catch (e) {
            return false;
        }
    }
    organizationForgetPasswordEmail(data) {
        var _a;
        try {
            (_a = this.channel) === null || _a === void 0 ? void 0 : _a.sendToQueue(this.NOTIFICATION_QUEUE, Buffer.from(JSON.stringify(data)));
            return true;
        }
        catch (e) {
            return false;
        }
    }
}
// const COMMUNICATION_PROVIDER: CommunicationProvider = {
//     notificationConnection: async (QUEUE: string): Promise<amqplib.Channel> => {
//         const connection: amqplib.Connection = await amqplib.connect("amqp://localhost");
//         const channel: amqplib.Channel = await connection.createChannel();
//         await channel.assertQueue(QUEUE);
//         return channel;
//     },
//     signInOTPSender: async function (data: any): Promise<boolean> {
//         try {
//             const NOTIFICATION_QUEUE: string = process.env.USER_SIGN_IN_NOTIFICATION as string;
//             const channel: amqplib.Channel = await this.notificationConnection(NOTIFICATION_QUEUE);
//             channel.sendToQueue(NOTIFICATION_QUEUE, Buffer.from(JSON.stringify(data)));
//             return true
//         } catch (e) {
//             console.log(e);
//             return false
//         }
//     },
//     signUpOTPSender: async function (data: any): Promise<boolean> {
//         try {
//             const NOTIFICATION_QUEUE: string = process.env.USER_SIGN_UP_NOTIFICATION as string;
//             const channel: amqplib.Channel = await this.notificationConnection(NOTIFICATION_QUEUE);
//             channel.sendToQueue(NOTIFICATION_QUEUE, Buffer.from(JSON.stringify(data)));
//             console.log("Notification communication has been sent");
//             return true
//         } catch (e) {
//             console.log(e);
//             console.log("Message Sending Failed");
//             return false
//         }
//     },
//     adminForgetPasswordEmail: async function (data: any): Promise<boolean> {
//         try {
//             const NOTIFICATION_QUEUE: string = process.env.ADMIN_FORGETPASSWORD_EMAIL as string;
//             const channel: amqplib.Channel = await this.notificationConnection(NOTIFICATION_QUEUE);
//             channel.sendToQueue(NOTIFICATION_QUEUE, Buffer.from(JSON.stringify(data)));
//             console.log("Notification for admin password reset");
//             return true
//         } catch (e) {
//             console.log(e);
//             console.log("Message Sending Failed");
//             return false;
//         }
//     },
//     organizationForgetPasswordEmail: async function (data: any): Promise<boolean> {
//         try {
//             const NOTIFICATION_QUEUE: string = process.env.ORGANIZATION_FORGETPASSWORD_EMAIL as string;
//             const channel: amqplib.Channel = await this.notificationConnection(NOTIFICATION_QUEUE);
//             channel.sendToQueue(NOTIFICATION_QUEUE, Buffer.from(JSON.stringify(data)));
//             console.log("Notification for organization password reset");
//             return true;
//         } catch (e) {
//             console.log(e);
//             console.log("Message Sending Failed");
//             return false
//         }
//     }
// };
exports.default = AuthNotificationProvider;
