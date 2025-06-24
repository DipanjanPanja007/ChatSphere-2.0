import asyncHandler from "express-async-handler";
import { Message } from "../models/message.model.js"
import { User } from "../models/user.model.js"
import { Chat } from "../models/chat.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import mime from "mime-types";
import path from "path";
import fs from "fs";

const sendMessage = asyncHandler(async (req, res) => {
    const { content, chatId, replyTo } = req.body;
    console.log("📥 Request body:", req.body);

    if (!chatId) {
        return res.status(400).json({ message: "chatId is required" });
    }

    let attachments = [];

    if (req.files?.length > 0) {
        const uploadPromises = req.files.map((file) => {
            const mimeType = mime.lookup(file.originalname);
            const baseName = path.parse(file.originalname).name;
            const finalName = `${Date.now()}-${baseName}`;

            // Only upload images, videos, and audio
            if (
                mimeType?.startsWith("image/") ||
                mimeType?.startsWith("video/") ||
                mimeType?.startsWith("audio/")
            ) {
                return uploadOnCloudinary(file.path, finalName);
            } else {
                // Cleanup skipped files
                fs.unlinkSync(file.path);
                return { skipped: true };
            }
        });

        const uploadedFiles = await Promise.all(uploadPromises);

        attachments = req.files.map((file, index) => {
            const uploaded = uploadedFiles[index];
            const mimeType = mime.lookup(file.originalname);

            const resolveType = (type) => {
                if (!type) return "document";
                if (type === "image/gif") return "gif";
                if (type.startsWith("image/")) return "image";
                if (type.startsWith("video/")) return "video";
                if (type.startsWith("audio/")) return "audio";
                return "document";
            };

            if (uploaded?.skipped) return null;
            if (!uploaded?.secure_url) return null;

            return {
                url: uploaded.secure_url,
                fileType: resolveType(mimeType),
            };
        }).filter(Boolean);
    }

    if (!content && attachments.length === 0) {
        return res.status(400).json({ message: "Either content or attachment is required" });
    }

    try {
        const newMessage = {
            sender: req.user._id,
            content,
            attachments,
            chat: chatId,
            replyTo: replyTo || null,
            readBy: [req.user._id],
        };

        let message = await Message.create(newMessage);

        message = await message.populate([
            { path: "sender", select: "name profilePic" },
            { path: "chat" },
            {
                path: "replyTo",
                populate: {
                    path: "sender",
                    select: "name email profilePic"
                }
            },
            { path: "readBy", select: "name profilePic email" },
        ]);

        message = await User.populate(message, {
            path: "chat.users",
            select: "name profilePic email",
        });

        message = await Message.populate(message, {
            path: "chat.latestMessage",
        });

        await Chat.findByIdAndUpdate(chatId, { latestMessage: message });

        return res.status(201).json({ message });

    } catch (err) {
        console.error("❌ Message send error:", err);
        return res.status(400).json({
            message: `Caught an error while sending message: ${err.message}`,
        });
    }
});


const allMessages = asyncHandler(async (req, res) => {
    try {
        const messages = await Message.find({ chat: req.params.chatId })
            .populate("sender", "name profilePic email")
            .populate("chat")
            .populate({
                path: "replyTo",
                populate: [{
                    path: "sender",
                    select: "name profilePic email"
                }, {
                    path: "chat",
                    select: "chatName groupIcon"
                }
                ]
            })
            .populate("readBy", "name profilePic email");

        return res.status(201).json({ messages });
    } catch (error) {
        return res.status(400).json({
            message: `Caught error while fetching all messages for a chat: ${error.message}`
        });
    }
});


const updateReaction = asyncHandler(async (req, res) => {

    /**
     * step#1: Extract messageId and reaction from request body
     * step#2: Validate that messageId and reaction are provided
     * step#3: FindById the message by messageId
     * step#4: if user already reacted, update the reaction
     * step#5: if user has not reacted, push the reaction to the message's reactions array
     */

    // step#1: Extract messageId and reaction from request body
    const { messageId, reaction } = req.body;

    // step#2: Validate that messageId and reaction are provided
    if (!messageId || !reaction) {
        return res.status(400).json({
            message: "messageId and reaction are required",
        });
    }

    try {
        // step#3: FindById the message by messageId
        const message = await Message.findById(messageId);

        if (!message) {
            return res.status(404).json({
                message: "Message not found",
            });
        }

        // Check if the user has already reacted
        const existingReaction = message.reactions.find(
            (r) => r.userId.toString() === req.user._id.toString()
        );

        if (existingReaction) {
            // if user reacted with same reaction, remove it
            if (existingReaction.reaction === reaction) {
                message.reactions = message.reactions.filter(r => r.userId.toString() !== req.user._id.toString());
            }
            else {
                // step#4: if user already reacted, update the reaction
                existingReaction.reaction = reaction;
            }
        } else {
            // step#5: if user has not reacted, push the reaction to the message's reactions array
            message.reactions.push({
                userId: req.user._id,
                reaction,
            });
        }

        await message.save();

        return res
            .status(200)
            .json({
                message: "Reaction updated successfully",
                data: message,
            });
    } catch (error) {
        return res.status(500).json({
            message: `Error updating reaction: ${error.message}`,
        });
    }
});



export {
    sendMessage,
    allMessages,
    updateReaction,
}