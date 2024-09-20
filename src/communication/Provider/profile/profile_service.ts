import * as amqplib from 'amqplib';
import { AuthData } from '../../../config/Datas/InterFace';
import { IBaseProfileData, IBaseUser } from '../../../config/Interface/Objects/IBaseUser';

interface PROFILE_COMMUNICATION_PROVIDER_INTERFACE {
    authDataTransfer(baseUSER: IBaseProfileData): Promise<void>
    _init_(): void
}


class ProfileCommunicationProvider implements PROFILE_COMMUNICATION_PROVIDER_INTERFACE {


    private connection: amqplib.Connection | null = null;
    private channel: amqplib.Channel | null = null
    private readonly Queue: string = process.env.AUTH_TRANSFER as string;

    async _init_() {
        console.log("Queue : " +  this.Queue);
        
        this.connection = await amqplib.connect("amqp://localhost");
        this.channel = await this.connection.createChannel();
    }

    async authDataTransfer(baseUser: IBaseProfileData): Promise<void> {
        try {

            const authData: IBaseProfileData = {
                first_name: baseUser['first_name'],
                last_name: baseUser['last_name'],
                email: baseUser['email'],
                location: baseUser['location'],
                phone_number: baseUser['phone_number'],
                user_id: baseUser['user_id'],
                profile_id: baseUser['profile_id'],
            };

            this.channel?.sendToQueue(this.Queue, Buffer.from(JSON.stringify(authData)));

        } catch (e) {
            console.error(e);
        }
    }

}


// const PROFILE_COMMUNICATION_PROVIDER: PROFILE_COMMUNICATION_PROVIDER_INTERFACE = {
//     authTransferConnection: async (queue_name: string): Promise<amqplib.Channel | null> => {
//         try {
//             const connection: amqplib.Connection = await amqplib.connect("amqp://localhost");
//             const channel: amqplib.Channel = await connection.createChannel();
//             await channel.assertQueue(queue_name);
//             return channel;
//         } catch (e) {
//             return null;
//         }
//     },

//     authDataTransfer: async function (first_name: string, last_name: string, email: string, location: object, phone_number: number, user_id: string, profile_id: string): Promise<void> {
//         try {
//             const queueName: string = process.env.AUTH_TRANSFER ?? "";
//             if (!queueName) {
//                 throw new Error("AUTH_TRANSFER environment variable is not set");
//             }

//             const authTransferConnection: amqplib.Channel | null = await this.authTransferConnection(queueName);
//             if (authTransferConnection) {
//                 const authData: AuthData = {
//                     first_name,
//                     last_name,
//                     email,
//                     location,
//                     phone_number,
//                     user_id,
//                     profile_id
//                 };

//                 authTransferConnection.sendToQueue(queueName, Buffer.from(JSON.stringify(authData)));
//                 console.log("Auth data has been transferred");
//             } else {
//                 console.log("Auth data transfer failed");
//             }
//         } catch (e) {
//             console.log("Something went wrong while sending data to auth profile");
//             console.error(e);
//         }
//     }
// };

export default ProfileCommunicationProvider;


