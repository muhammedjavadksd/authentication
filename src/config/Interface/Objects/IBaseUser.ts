interface IBaseUser {
    first_name: string
    last_name: string
    phone_number: number
    email: string
    auth_id: string
    auth_provider: string
    location: string
    user_id?: string
    profile_id?: string
}



export default IBaseUser