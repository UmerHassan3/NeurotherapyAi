import express from "express";
import { Signin, SignUp, ForgotPassword, SignOut, CheckAuth } from "../../Controllers/Auth.Controller.js";

const router = express.Router();

router.post("/signin", Signin);
router.post("/signup", SignUp);
router.delete("/signout", SignOut);
router.post("/forgot-password", ForgotPassword);
router.get("/checkauth", CheckAuth);

export default router;