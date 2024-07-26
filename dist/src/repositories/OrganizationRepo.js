"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const organizationAuth_1 = __importDefault(require("../db/model/organizationAuth"));
class OrganizationRepo {
    constructor() {
        this.findOrganization = this.findOrganization.bind(this);
        this.updateOrganizationByModel = this.updateOrganizationByModel.bind(this);
        this.organizationAuth = organizationAuth_1.default;
    }
    findOrganizationById(organization_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const organization = yield this.organizationAuth.findById(organization_id);
            return organization;
        });
    }
    updateOrganizationById(organization_id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const updateOrganization = yield this.organizationAuth.updateOne({ id: organization_id }, { $set: data });
            return updateOrganization.modifiedCount > 0;
        });
    }
    updateOrganizationByModel(organization) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield organization.save();
                return true;
            }
            catch (e) {
                console.log(e);
                return false;
            }
        });
    }
    findOrganization(email_address) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const organization = yield this.organizationAuth.findOne({ email_address });
                if (organization) {
                    return organization;
                }
                else {
                    return null;
                }
            }
            catch (e) {
                console.log(e);
                return null;
            }
        });
    }
}
exports.default = OrganizationRepo;
