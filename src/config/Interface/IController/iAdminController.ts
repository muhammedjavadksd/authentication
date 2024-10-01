import { NextFunction, Request, Response } from "express"

interface IAdminController {
    organizationSingleView(req: Request, res: Response, next: NextFunction): Promise<void>
    organizationPaginationView(req: Request, res: Response, next: NextFunction): Promise<void>
    signInController(req: Request, res: Response, next: NextFunction): Promise<void>
    forgetPasswordController(req: Request, res: Response, next: NextFunction): Promise<void>
    adminPasswordReset(req: Request, res: Response): Promise<void>
    updateOrganizationStatus(req: Request, res: Response): Promise<void>
    updateSettings(req: Request, res: Response): Promise<void>
}

export default IAdminController