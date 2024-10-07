"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const morgan_1 = __importDefault(require("morgan"));
const BulkDataConsumer_1 = __importDefault(require("./src/communication/BulkDataConsumer"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cors_1.default)({
    origin: ["http://localhost:3000", "https://life-link.online", "https://www.life-link.online"]
}));
const connection_1 = __importDefault(require("./src/db/connection"));
const userRouter_1 = __importDefault(require("./src/router/userRouter"));
const adminRouter_1 = __importDefault(require("./src/router/adminRouter"));
dotenv_1.default.config({ path: "./.env" });
(0, BulkDataConsumer_1.default)();
app.use((0, morgan_1.default)("common"));
app.use("/", userRouter_1.default);
app.use("/admin", adminRouter_1.default);
(0, connection_1.default)();
const PORT = parseInt(process.env.PORT) || 7002;
app.listen(PORT, () => {
    console.log("Auth Service started at Port : " + PORT);
});
