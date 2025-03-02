import express from "express";
const router = express.Router();
import { registerUser, loginUser, allUsers, reqOTP, updateProfilePic, deleteProfilePic } from "../controllers/user.controller.js"
import { upload } from "../middleware/multer.middleware.js";
import { verifyJWT } from "../middleware/auth.middleware.js"

router.route('/')
    .post(upload.single('profilePic'), registerUser)
    .get(verifyJWT, allUsers)

router.post('/login', loginUser);

router.post('/otp', reqOTP);

router.put('/updateDp', upload.single('profilePicture'), verifyJWT, updateProfilePic);

router.delete('/deleteDp', verifyJWT, deleteProfilePic);


export default router;