import IOrganizationAuthModel from "../../config/Interface/IModel/OrganizationAuthModel/IOrganizationModel";
import { IOrganizationRepo } from "../../config/Interface/RepositoriesInterface";
import OrganizationAuth from "../../db/models/organizationAuth";


class OrganizationRepo implements IOrganizationRepo {

    private organizationAuth;

    constructor() {
        this.organizationAuth = OrganizationAuth
    }

    async updateOrganization(organization: IOrganizationAuthModel): Promise<boolean> {
        try {
            await organization.save()
            return true
        } catch (e) {
            console.log(e);
            return false
        }
    }

    async findOrganization(email_address: string): Promise<IOrganizationAuthModel | null> {
        try {
            const organization: IOrganizationAuthModel | null = await this.organizationAuth.findOne({ email_address });
            if (organization) {
                return organization
            } else {
                return null
            }
        } catch (e) {
            console.log(e);
            return null
        }
    }
}


export default OrganizationRepo