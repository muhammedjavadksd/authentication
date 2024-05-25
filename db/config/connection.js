const { default: mongoose } = require("mongoose")

function authenticationDbConnection() {
    console.log(process.env.MONGO_DEV_URL)
    mongoose.connect(process.env.MONGO_DEV_URL, { useNewUrlParser: true }).then(() => {
        console.log("Authentication database has been connected")
    }).catch((err) => {
        console.log(err)
        console.log("Authentication database has been failed");
    })
}

module.exports = authenticationDbConnection