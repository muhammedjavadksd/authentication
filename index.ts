import express, { Express } from "express";
import dotenv from "dotenv";
import authenticationDbConnection from "./src/db/connection";
import userRouter from "./src/router/userRouter";
import adminRouter from "./src/router/adminRouter";
import logger from "morgan";
import organizationRouter from "./src/router/organizationRouter";
import BulkDataConsumer from "./src/communication/BulkDataConsumer";
import cors from 'cors'

const app: Express = express();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: ["http://localhost:3000", "https://life-link.online"]
}))

dotenv.config({ path: "./.env" });

BulkDataConsumer()

app.use(logger("common"));

app.use("/", userRouter);
app.use("/admin", adminRouter);
// app.use("/organization", organizationRouter);

authenticationDbConnection();

const PORT: number = parseInt(process.env.PORT as string) || 7002;

app.listen(PORT, () => {
    console.log("Auth Service started at Port : " + PORT);
});