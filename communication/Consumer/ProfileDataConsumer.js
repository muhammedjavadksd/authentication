let amqplib = require("amqplib");
const authHelper = require("../../helper/authUserHelper");

let ProfielDataConsumer = {


    _getChannel: async (queue_name) => {
        try {
            let connection = await amqplib.connect("amqp://localhost");
            let channel = await connection.createChannel()
            await channel.assertQueue(queue_name);
            return channel
        } catch (e) {
            return null;
        }
    },

    authProfileUpdation: async function () {

        let queueName = process.env.AUTH_DATA_UPDATE_QUEUE;
        let channel = await this._getChannel();
        if (channel) {
            channel.consume(queueName, async (msg) => {
                if (msg) {
                    let messageContent = JSON.parse(msg.content.toString());
                    console.log("Update profile content is :");
                    console.log(messageContent);

                    let profile_id = messageContent.profile_id;
                    if (profile_id) {
                        await authHelper.updateUserProfile(messageContents, profile_id)
                        console.log("Authentication data has been updated ");
                    }
                }
            }, { noAck: true })
        }
    }
}


module.exports = ProfielDataConsumer;