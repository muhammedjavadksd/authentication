"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const body_parser_1 = __importDefault(require("body-parser"));
const connection_1 = __importDefault(require("./src/db/config/connection"));
const userRouter_1 = __importDefault(require("./src/router/userRouter/userRouter"));
const adminRouter_1 = __importDefault(require("./src/router/adminRouter/adminRouter"));
const morgan_1 = __importDefault(require("morgan"));
const organizationRouter_1 = __importDefault(require("./src/router/organization/organizationRouter"));
const BulkDataConsumer_1 = __importDefault(require("./src/communication/BulkDataConsumer"));
const app = (0, express_1.default)();
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
dotenv_1.default.config();
(0, BulkDataConsumer_1.default)();
app.use((0, morgan_1.default)("common"));
app.use("/", userRouter_1.default);
app.use("/admin", adminRouter_1.default);
app.use("/organization", organizationRouter_1.default);
(0, connection_1.default)();
const PORT = parseInt(process.env.PORT) || 7002;
app.listen(PORT, () => {
    console.log("Auth Service started at Port : " + PORT);
});
