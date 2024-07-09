// const ProfielDataConsumer = require("./Consumer/ProfileDataConsumer")
import ProfielDataConsumer from "./Consumer/ProfileDataConsumer"



async function bulkConsumer(): Promise<void> {

    const profileDataConsumer = new ProfielDataConsumer()

    await profileDataConsumer._init_();
    profileDataConsumer.authProfileUpdation()

}


export default bulkConsumer()