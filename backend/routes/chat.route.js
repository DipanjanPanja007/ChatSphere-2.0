import express from "express";
import { verifyJWT } from "../middleware/auth.middleware.js"
import { accessChat, addToGroup, createGroupChat, fetchChats, removeFromGroup, renameGroup } from "../controllers/chat.controller.js";

const router = express.Router();

router.route("/").post(verifyJWT, accessChat);                  // access or create one-to-one chat, 
router.route("/").get(verifyJWT, fetchChats);                   // to fetch all chats with me
router.route("/group").post(verifyJWT, createGroupChat);        //
router.route("/rename").put(verifyJWT, renameGroup);            //
router.route("/groupadd").put(verifyJWT, addToGroup);           //
router.route("/groupremove").put(verifyJWT, removeFromGroup);   //




export default router; 
