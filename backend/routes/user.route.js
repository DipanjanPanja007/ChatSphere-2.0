import express from "express";
const router = express.Router();
import { registerUser, loginUser, allUsers } from "../controllers/user.controller.js"
import { upload } from "../middleware/multer.middleware.js";
import { verifyJWT } from "../middleware/auth.middleware.js"

router.route('/')
    .post(upload.single('profilePic'), registerUser)
    .get(verifyJWT, allUsers)

router.post('/login', loginUser);




export default router;