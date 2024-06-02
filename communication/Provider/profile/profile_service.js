let amqplib = require("amqplib")

let PROFILE_COMMUNICATION_PROVIDER = {


    authTransferConnection: async (queue_name) => {
        try {
            let connection = await amqplib.connect("amqp://localhost");
            let channel = await connection.createChannel();
            await channel.assertQueue(queue_name);
            return channel

        } catch (e) {
            return null;
        }
    },

    authDataTransfer: async function (first_name, last_name, email, location, phone_number, user_id) {
        try {
            let queueName = process.env.AUTH_TRANSFER;
            let authTransferConnection = await this.authTransferConnection(queueName);
            if (authTransferConnection) {



                authTransferConnection.sendToQueue(queueName, Buffer.from(JSON.stringify({
                    first_name,
                    last_name,
                    email,
                    location,
                    phone_number,
                    user_id
                })))
                console.log("Auth data has been transfered");
            } else {
                console.log("Auth data transfer failed");
            }
        } catch (e) {
            console.log("Something went wrong happend while sending data to auth profile");
            console.log(e);
        }
    }
}

module.exports = PROFILE_COMMUNICATION_PROVIDER;