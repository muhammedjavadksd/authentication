import { NextFunction, Response, Request } from "express"
import { CustomRequest } from "../../Datas/InterFace"


interface IAuthMiddleware {
    isValidSignUpAttempt(req: CustomRequest, res: Response, next: NextFunction): void
    isUserLogged(req: Request, res: Response, next: NextFunction): void
    isAdminLogged(req: Request, res: Response, next: NextFunction): void
    isOrganizationLogged(req: Request, res: Response, next: NextFunction): void
}

export default IAuthMiddleware