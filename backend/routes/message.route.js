import express from "express"
import { verifyJWT } from "../middleware/auth.middleware.js";
import { addReaction, removeReaction, allMessages, sendMessage } from "../controllers/message.controller.js";
import { upload } from "../middleware/multer.middleware.js";



const router = express.Router();

router.route("/").post(verifyJWT, upload.array("files"), sendMessage)
router.route("/:chatId").get(verifyJWT, allMessages)
router.route("/addReaction").put(verifyJWT, addReaction)
router.route("/removeReaction").put(verifyJWT, removeReaction)

export default router; 