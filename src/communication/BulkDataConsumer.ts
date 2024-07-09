// const ProfielDataConsumer = require("./Consumer/ProfileDataConsumer")
import ProfielDataConsumer from "./Consumer/ProfileDataConsumer"



export default function bulkConsumer(): void {
    ProfielDataConsumer.authProfileUpdation()
}