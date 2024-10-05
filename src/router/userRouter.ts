import express, { Request, Response, Router } from "express";
import UserAuthController from "../controller/userController";
import AuthMiddleware from "../middleware/authMiddleware";

const router: Router = express.Router();
const AuthController = new UserAuthController()
const UserMiddleware = new AuthMiddleware()

// POST METHOD 

router.get("/", (req: Request, res: Response) => {
    res.status(200).send("Welcome to authentication service");
})

router.post("/sign_up_provider", AuthController.signUpWithProvide);
router.post("/sign_up", AuthController.signUpController);
router.post("/sign_in", AuthController.signInController);
router.post("/sign_in_with_token", UserMiddleware.isUserLogged, AuthController.signWithToken); //retry login attemo for logged users
router.post("/auth_otp_submission", UserMiddleware.isValidSignUpAttempt, AuthController.AuthOTPSubmission);
router.post("/resend_otp", UserMiddleware.isValidSignUpAttempt, AuthController.resetOtpNumber);
router.post("/refresh_token", AuthController.refreshToken);

//PUT METHOD
router.put("/edit_auth_phone", UserMiddleware.isValidSignUpAttempt, AuthController.editAuthPhoneNumber);

//PATCH METHOD
router.patch("/update_auth", UserMiddleware.isUserLogged, AuthController.updateAuth);
router.patch("/complete_account", AuthController.completeAccount);

router.get("*", (req: Request, res: Response) => {
    res.status(404).send("Page not found")
})

export default router;


