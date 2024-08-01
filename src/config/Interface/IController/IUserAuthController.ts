import { Request, Response, NextFunction } from "express"
import { CustomRequest } from "../../Datas/InterFace"


interface IUserAuthController {
    signUpController(req: Request, res: Response, next: NextFunction): Promise<void>
    signInController(req: Request, res: Response, next: NextFunction): Promise<void>
    AuthOTPSubmission(req: CustomRequest, res: Response, next: NextFunction): Promise<void>
    editAuthPhoneNumber(req: CustomRequest, res: Response, next: NextFunction): Promise<void>
    resetOtpNumber(req: CustomRequest, res: Response, next: NextFunction): Promise<void>
    updateAuth(req: CustomRequest, res: Response, next: NextFunction): Promise<void>
}

export default IUserAuthController