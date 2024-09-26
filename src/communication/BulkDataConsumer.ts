// const ProfielDataConsumer = require("./Consumer/ProfileDataConsumer")
import ProfielDataConsumer from "./Consumer/ProfileDataConsumer"



async function bulkConsumer(): Promise<void> {

    const profileDataConsumer = new ProfielDataConsumer()

    try {
        await profileDataConsumer._init_();
        profileDataConsumer.authProfileUpdation()
    } catch (e) {

    }

}


export default bulkConsumer