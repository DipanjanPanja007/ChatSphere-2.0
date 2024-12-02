import express from "express"
import { verifyJWT } from "../middleware/auth.middleware.js";
import { allMessages, sendMessage } from "../controllers/message.controller.js";



const router = express.Router();

router.route("/").post(verifyJWT, sendMessage)
router.route("/:chatId").get(verifyJWT, allMessages)

export default router; 