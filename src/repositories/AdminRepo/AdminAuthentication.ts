import IAdminAuthModel from "../../config/Interface/IModel/AdminAuthModel/IAdminAuthModel";
import AdminAuthModel from "../../db/models/adminAuth";


interface IAdminAuthenticationRepo {
    findAdmin(email: string): Promise<IAdminAuthModel | null>
    updateAdmin(admin: IAdminAuthModel): Promise<boolean>
}


class AdminAuthenticationRepo implements IAdminAuthenticationRepo {

    private AdminAuthCollection;

    constructor() {
        this.AdminAuthCollection = AdminAuthModel
    }


    async updateAdmin(admin: IAdminAuthModel): Promise<boolean> {
        try {
            await admin.save();
            return true
        } catch (e) {
            return false;
        }
    }

    async findAdmin(email: string): Promise<IAdminAuthModel | null> {
        const findAdmin = await this.AdminAuthCollection.findOne({ email_address: email });
        if (findAdmin) {
            return findAdmin
        } else {
            return null
        }
    }

}
export default AdminAuthenticationRepo 