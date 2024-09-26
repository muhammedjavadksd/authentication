import { NextFunction, Request, Response } from "express"

interface IOrganizationControllerInterface {
    signUpController(req: Request, res: Response, next: NextFunction): void,
    signInController(req: Request, res: Response, next: NextFunction): void
    forgetPasswordController(req: Request, res: Response, next: NextFunction): void
    resetPasswordController(req: Request, res: Response, next: NextFunction): void
}

export default IOrganizationControllerInterface