import express, { Express } from "express";
import dotenv from "dotenv";
import bodyparser from "body-parser";
import authenticationDbConnection from "./db/config/connection";
import userRouter from "./router/userRouter/userRouter";
import adminRouter from "./router/adminRouter/adminRouter";
import logger from "morgan";
import BulkConsumer from './communication/BulkDataConsumer'
import organizationRouter from "./router/organization/organizationRouter";




const app: Express = express();

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));



dotenv.config();

BulkConsumer();

app.use(logger("common"));

app.use("/", userRouter);
app.use("/admin", adminRouter);
app.use("/organization", organizationRouter);

authenticationDbConnection();

const PORT: number = parseInt(process.env.PORT as string) || 7002;

app.listen(PORT, () => {
    console.log("Auth Service started at Port : " + PORT);
});