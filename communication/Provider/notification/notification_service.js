
const amqplib = require("amqplib");


let COMMUNICATION_PROVIDER = {

    notificationConnection: async (QUEUE) => {

        let connection = await amqplib.connect("amqp://localhost");
        let channel = await connection.createChannel();

        await channel.assertQueue(QUEUE);
        return channel
    },


    signInOTPSender: async function (data) {
        try {

            let NOTIFICAION_QUEUE = process.env.USER_SIGN_IN_NOTIFICATION
            let channel = await this.notificationConnection(NOTIFICAION_QUEUE)
            channel.sendToQueue(NOTIFICAION_QUEUE, Buffer.from(JSON.stringify(data)))
            console.log("Sign in OTP has been sent")
        } catch (e) {
            console.log(e)
        }
    },


    signUpOTPSender: async function (data) {


        try {
            let NOTIFICAION_QUEUE = process.env.USER_SIGN_UP_NOTIFICATION
            let channel = await this.notificationConnection(NOTIFICAION_QUEUE)
            channel.sendToQueue(NOTIFICAION_QUEUE, Buffer.from(JSON.stringify(data)))

            console.log("Notification  communication has been sented")
        } catch (e) {

            console.log(e)
            console.log("Message Senting Failed")
        }
    },


    adminForgetPasswordEmail: async function (data) {

        try {
            let NOTIFICAION_QUEUE = process.env.ADMIN_FORGETPASSWORD_EMAIL;
            let channel = await this.notificationConnection(NOTIFICAION_QUEUE)

            channel.sendToQueue(NOTIFICAION_QUEUE, Buffer.from(JSON.stringify(data)))
            console.log("Notification for admin password reset");
        } catch (e) {
            console.log(e)
            console.log("Message Senting Failed")
        }
    },

    organizationForgetPasswordEmail: async function (data) {

        try {
            let NOTIFICAION_QUEUE = process.env.ORGANIZATION_FORGETPASSWORD_EMAIL;
            let channel = await this.notificationConnection(NOTIFICAION_QUEUE)

            channel.sendToQueue(NOTIFICAION_QUEUE, Buffer.from(JSON.stringify(data)))
            console.log("Notification for organization password reset");
        } catch (e) {
            console.log(e)
            console.log("Message Senting Failed")
        }
    }
}

module.exports = COMMUNICATION_PROVIDER