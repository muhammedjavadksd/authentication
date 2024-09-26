import mongoose, { ConnectOptions } from "mongoose";

function authenticationDbConnection() {
    console.log(process.env.MONGO_DEV_URL);
    mongoose.connect(process.env.MONGO_DEV_URL!, { useNewUrlParser: true } as ConnectOptions)
        .then(() => {
            console.log("Authentication database has been connected");
        })
        .catch((err) => {
            console.log(err);
            console.log("Authentication database has been failed");
        });
}

export default authenticationDbConnection;

