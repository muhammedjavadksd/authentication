// let amqplib = require("amqplib");
import amqplib, { Channel, Connection } from 'amqplib';
const authHelper = require("../../helper/authUserHelper");

interface ProfielDataConsumerInterface {

    // _getChannel(queue_name: string): Promise<amqplib.Channel | null>,
    authProfileUpdation(): void
}


class ProfileDataConsumer implements ProfielDataConsumerInterface {

    private connection: amqplib.Connection | null = null;
    private channel: amqplib.Channel | null = null
    private readonly Queue: string = process.env.AUTH_DATA_UPDATE_QUEUE as string;

    async _init_() {
        this.connection = await amqplib.connect("amqp://localhost");
        this.channel = await this.connection.createChannel();
    }


    authProfileUpdation(): void {
        this.channel?.consume(this.Queue, async (msg) => {
            if (msg) {

                const messageContent = JSON.parse(msg.content.toString());
                console.log(messageContent);

                const profile_id: string = messageContent.profile_id;
                if (profile_id) {
                    await authHelper.updateUserProfile(messageContent.edit_details, profile_id)
                    console.log("Authentication data has been updated ");
                }
            }
        }, { noAck: true })
    }
}




// let ProfielDataConsumer: ProfielDataConsumerInterface = {


//     _getChannel: async (queue_name: string): Promise<amqplib.Channel | null> => {
//         try {
//             const connection: Connection = await amqplib.connect("amqp://localhost");
//             const channel: Channel = await connection.createChannel()
//             await channel.assertQueue(queue_name, { durable: true });
//             return channel
//         } catch (e) {
//             return null;
//         }
//     },

//     authProfileUpdation: async function (): Promise<void> {


//         const queueName: string = process.env.AUTH_DATA_UPDATE_QUEUE!;
//         const channel: Channel | null = await this._getChannel(queueName);
//         if (channel) {

//             channel.consume(queueName, async (msg) => {

//                 if (msg) {
//                     console.log("This msg");

//                     const messageContent = JSON.parse(msg.content.toString());
//                     console.log("Update profile content is :");
//                     console.log(messageContent);

//                     const profile_id: string = messageContent.profile_id;
//                     if (profile_id) {
//                         await authHelper.updateUserProfile(messageContent.edit_details, profile_id)
//                         console.log("Authentication data has been updated ");
//                     }
//                 }
//             }, { noAck: true })
//         }
//     }
// }


// module.exports = ProfielDataConsumer;
export default ProfileDataConsumer