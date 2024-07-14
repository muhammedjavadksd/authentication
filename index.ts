import express, { Express } from "express";
import dotenv from "dotenv";
import bodyparser from "body-parser";
import authenticationDbConnection from "./src/db/config/connection";
import userRouter from "./src/router/userRouter/userRouter";
import adminRouter from "./src/router/adminRouter/adminRouter";
import logger from "morgan";
import organizationRouter from "./src/router/organization/organizationRouter";
import BulkDataConsumer from "./src/communication/BulkDataConsumer";

const app: Express = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

dotenv.config({path:"./.env"});

BulkDataConsumer()

app.use(logger("common"));

app.use("/", userRouter);
app.use("/admin", adminRouter);
app.use("/organization", organizationRouter);

authenticationDbConnection();

const PORT: number = parseInt(process.env.PORT as string) || 7002;

app.listen(PORT, () => {
    console.log("Auth Service started at Port : " + PORT);
});