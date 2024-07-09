// let amqplib = require("amqplib");
import amqplib, { Channel, Connection } from 'amqplib';
import UserAuthenticationRepo from '../../repositories/UserRepo/UserAuthentication';
import mongoose from 'mongoose';

interface ProfielDataConsumerInterface {
    _init_(): void
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
                    const userRepo = new UserAuthenticationRepo();

                    await userRepo.updateUserById(new mongoose.Types.ObjectId(profile_id), messageContent.edit_details)
                    console.log("Authentication data has been updated ");
                }
            }
        }, { noAck: true })
    }
}

export default ProfileDataConsumer