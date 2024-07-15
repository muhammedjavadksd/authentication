import { Document } from "mongoose"


interface IAdminAuthModel extends Document {
    name: string
    email_address: string
    password: string
    last_logged: string
    token: string
}

export default IAdminAuthModel