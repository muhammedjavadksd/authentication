
//Imports
const express = require("express");
const app = express();
const dotenv = require("dotenv");

//middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const authenticationDbConnection = require("./db/config/connection");
const userRouter = require("./router/userRouter/userRouter")
const adminRouter = require("./router/adminRouter/adminRouter")
const logger = require("morgan")
const bcrypt = require("bcrypt")


app.use((req, res, next) => {
    console.log("Request came");
    next()
})


app.use(logger("common"))
app.use("/", userRouter)
app.use("/admin", adminRouter)

//Config
dotenv.config("./.env");
authenticationDbConnection()

//const
const PORT = process.env.PORT || 7002


// function createbcrypatPassword(plainPassword) {
//     console.log(process.env.BCRYPT_SALTROUND);
//     // const salt = bcrypt.genSaltSync(process.env.BCRYPT_SALTROUND);

//     bcrypt.compare(plainPassword, "$2b$10$ff.vnqbHKZpgUsRzsN0Pau.FJsfULwxPm7hFgTAMcwB7eKpXqgx0e").then((password) => {
//         console.log(password);
//     }).catch((err) => {
//         console.log(err);
//     })
// }


// createbcrypatPassword("adminpro")

app.listen(PORT, () => {
    console.log("Auth Service started at Port : " + PORT)
})