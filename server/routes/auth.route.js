import express from "express"
import { getUserById, loginUser, registerUser } from "../controllers/auth.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const authRouter = express.Router();

authRouter.post('/register',registerUser)
authRouter.post('/login',loginUser)
authRouter.get('/user',protect,getUserById)

export default authRouter