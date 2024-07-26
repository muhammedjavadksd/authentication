import { ObjectId } from "mongoose";
import IOrganizationAuthModel, { IOrganizationEditable } from "../config/Interface/IModel/IOrganizationModel";
import { IOrganizationRepo } from "../config/Interface/Repos/RepositoriesInterface";
import OrganizationAuth from "../db/model/organizationAuth";


class OrganizationRepo implements IOrganizationRepo {

    private organizationAuth;

    constructor() {
        this.findOrganization = this.findOrganization.bind(this)
        this.updateOrganizationByModel = this.updateOrganizationByModel.bind(this)
        this.organizationAuth = OrganizationAuth
    }

    async organizationPaginatedView(limit: number, skip: number): Promise<IOrganizationAuthModel[]> {
        const findOrganizations: IOrganizationAuthModel[] = await this.organizationAuth.find({}).skip(skip).limit(limit);
        return findOrganizations
    }

    async findOrganizationById(organization_id: ObjectId): Promise<IOrganizationAuthModel | null> {
        const organization: IOrganizationAuthModel | null = await this.organizationAuth.findById(organization_id);
        return organization
    }


    async updateOrganizationById(organization_id: ObjectId, data: IOrganizationEditable): Promise<boolean> {
        const updateOrganization = await this.organizationAuth.updateOne({ id: organization_id }, { $set: data })
        return updateOrganization.modifiedCount > 0
    }

    async updateOrganizationByModel(organization: IOrganizationAuthModel): Promise<boolean> {
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