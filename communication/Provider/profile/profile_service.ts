import * as amqplib from 'amqplib';
import { AuthData } from '../../../config/Datas/InterFace';

interface PROFILE_COMMUNICATION_PROVIDER_INTERFACE {
    authTransferConnection(queue_name: string): Promise<amqplib.Channel | null>
    authDataTransfer(first_name: string, last_name: string, email: string, location: object, phone_number: number, user_id: string, profile_id: string): Promise<void>
}


const PROFILE_COMMUNICATION_PROVIDER: PROFILE_COMMUNICATION_PROVIDER_INTERFACE = {
    authTransferConnection: async (queue_name: string): Promise<amqplib.Channel | null> => {
        try {
            const connection: amqplib.Connection = await amqplib.connect("amqp://localhost");
            const channel: amqplib.Channel = await connection.createChannel();
            await channel.assertQueue(queue_name);
            return channel;
        } catch (e) {
            return null;
        }
    },

    authDataTransfer: async function (first_name: string, last_name: string, email: string, location: object, phone_number: number, user_id: string, profile_id: string): Promise<void> {
        try {
            const queueName: string = process.env.AUTH_TRANSFER ?? "";
            if (!queueName) {
                throw new Error("AUTH_TRANSFER environment variable is not set");
            }

            const authTransferConnection: amqplib.Channel | null = await this.authTransferConnection(queueName);
            if (authTransferConnection) {
                const authData: AuthData = {
                    first_name,
                    last_name,
                    email,
                    location,
                    phone_number,
                    user_id,
                    profile_id
                };

                authTransferConnection.sendToQueue(queueName, Buffer.from(JSON.stringify(authData)));
                console.log("Auth data has been transferred");
            } else {
                console.log("Auth data transfer failed");
            }
        } catch (e) {
            console.log("Something went wrong while sending data to auth profile");
            console.error(e);
        }
    }
};

export default PROFILE_COMMUNICATION_PROVIDER;


