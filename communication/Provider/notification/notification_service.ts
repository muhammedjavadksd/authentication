import * as amqplib from 'amqplib';

interface CommunicationProvider {
    notificationConnection: (QUEUE: string) => Promise<amqplib.Channel>;
    signInOTPSender: (data: any) => Promise<boolean>;
    signUpOTPSender: (data: any) => Promise<boolean>;
    adminForgetPasswordEmail: (data: any) => Promise<boolean>;
    organizationForgetPasswordEmail: (data: any) => Promise<boolean>;
}

const COMMUNICATION_PROVIDER: CommunicationProvider = {
    notificationConnection: async (QUEUE: string): Promise<amqplib.Channel> => {
        const connection: amqplib.Connection = await amqplib.connect("amqp://localhost");
        const channel: amqplib.Channel = await connection.createChannel();

        await channel.assertQueue(QUEUE);
        return channel;
    },

    signInOTPSender: async function (data: any): Promise<boolean> {
        try {
            const NOTIFICATION_QUEUE: string = process.env.USER_SIGN_IN_NOTIFICATION as string;
            const channel: amqplib.Channel = await this.notificationConnection(NOTIFICATION_QUEUE);
            channel.sendToQueue(NOTIFICATION_QUEUE, Buffer.from(JSON.stringify(data)));
            return true
        } catch (e) {
            console.log(e);
            return false
        }
    },

    signUpOTPSender: async function (data: any): Promise<boolean> {
        try {
            const NOTIFICATION_QUEUE: string = process.env.USER_SIGN_UP_NOTIFICATION as string;
            const channel: amqplib.Channel = await this.notificationConnection(NOTIFICATION_QUEUE);
            channel.sendToQueue(NOTIFICATION_QUEUE, Buffer.from(JSON.stringify(data)));
            console.log("Notification communication has been sent");
            return true
        } catch (e) {
            console.log(e);
            console.log("Message Sending Failed");
            return false
        }
    },

    adminForgetPasswordEmail: async function (data: any): Promise<boolean> {
        try {
            const NOTIFICATION_QUEUE: string = process.env.ADMIN_FORGETPASSWORD_EMAIL as string;
            const channel: amqplib.Channel = await this.notificationConnection(NOTIFICATION_QUEUE);
            channel.sendToQueue(NOTIFICATION_QUEUE, Buffer.from(JSON.stringify(data)));
            console.log("Notification for admin password reset");
            return true
        } catch (e) {
            console.log(e);
            console.log("Message Sending Failed");
            return false;
        }
    },

    organizationForgetPasswordEmail: async function (data: any): Promise<boolean> {
        try {
            const NOTIFICATION_QUEUE: string = process.env.ORGANIZATION_FORGETPASSWORD_EMAIL as string;
            const channel: amqplib.Channel = await this.notificationConnection(NOTIFICATION_QUEUE);

            channel.sendToQueue(NOTIFICATION_QUEUE, Buffer.from(JSON.stringify(data)));
            console.log("Notification for organization password reset");
            return true;
        } catch (e) {
            console.log(e);
            console.log("Message Sending Failed");
            return false
        }
    }
};

export default COMMUNICATION_PROVIDER;

