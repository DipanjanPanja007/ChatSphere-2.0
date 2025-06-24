import express from "express"
import { verifyJWT } from "../middleware/auth.middleware.js";
import { allMessages, sendMessage, updateReaction } from "../controllers/message.controller.js";
import { upload } from "../middleware/multer.middleware.js";



const router = express.Router();

router.route("/").post(verifyJWT, upload.array("files"), sendMessage)
router.route("/:chatId").get(verifyJWT, allMessages)
router.route("/updateReaction").put(verifyJWT, updateReaction)

export default router; 