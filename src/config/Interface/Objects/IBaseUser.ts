import { locationTypeInterFace } from "../IModel/IUserAuthModel"

interface IBaseUser {
    first_name: string
    last_name: string
    phone_number?: number
    email: string
    auth_id: string
    auth_provider: string
    location?: locationTypeInterFace
    user_id?: string
    profile_id?: string
}

interface IBaseProfileData {
    first_name: string
    last_name: string
    phone_number: number
    email: string
    location?: locationTypeInterFace
    user_id: string
    profile_id: string
}


export { IBaseProfileData, IBaseUser }