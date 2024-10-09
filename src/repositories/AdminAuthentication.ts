import { IAdminAuthModel } from "../config/Datas/Interface/DatabaseModel";
import { IAdminRepo } from "../config/Datas/Interface/MethodInterface";
import AdminAuthModel from "../db/model/adminAuth";

class AdminAuthenticationRepo implements IAdminRepo {

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