
//Imports
const express = require("express");
const app = express();
const dotenv = require("dotenv");

//middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const authenticationDbConnection = require("./db/config/connection");
const userRouter = require("./router/userRouter/userRouter")
const logger = require("morgan")


app.use((req, res, next) => {
    console.log("Request came");
    next()
})





app.use(logger("combined"))
app.use("/", userRouter)


//Config
dotenv.config("./.env");
authenticationDbConnection()

//const
const PORT = process.env.PORT || 7002





app.listen(PORT, () => {
    console.log("Auth Service started at Port : " + PORT)
})