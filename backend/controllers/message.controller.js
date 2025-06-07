import asyncHandler from "express-async-handler";
import { Message } from "../models/message.model.js"
import { User } from "../models/user.model.js"
import { Chat } from "../models/chat.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const sendMessage = asyncHandler(async (req, res) => {
    //  Extract content, chatId, and replyTo from request body
    const { content, chatId, replyTo } = req.body;
    console.log("Request body:", req.body);

    let attachments = [];

    // If files are present, upload each to Cloudinary
    if (req.files && req.files.length > 0) {
        const uploadPromises = req.files.map(file =>
            uploadOnCloudinary(file.path, file.filename)
        );

        const uploadedFileURLs = await Promise.all(uploadPromises);
        console.log("Uploaded file URLs:", uploadedFileURLs);

        attachments = uploadedFileURLs.map((file) => ({
            url: file.secure_url,
            fileType: file.resource_type, // e.g., image, video
        }));
    }

    // Validation: At least content or one attachment must exist + chatId
    if (!chatId) {
        return res.status(400).json({
            message: "chatId is required",
        });
    }

    if ((!content && attachments.length === 0)) {
        return res.status(400).json({
            message: "Either content or attachment is required",
        });
    }

    // Prepare message object
    const newMessage = {
        sender: req.user._id,
        content,
        attachments,
        chat: chatId,
        replyTo: replyTo || null,
        readBy: [req.user._id],
    };

    try {
        let message = await Message.create(newMessage);

        //  Populate references for frontend use
        message = await message.populate([
            { path: "sender", select: "name profilePic" },
            { path: "chat" },
            { path: "replyTo" },
            { path: "readBy", select: "name profilePic email" }
        ]);

        message = await User.populate(message, {
            path: "chat.users",
            select: "name profilePic email",
        });

        message = await Message.populate(message, {
            path: "chat.latestMessage"
        });

        // Update latest message in chat
        await Chat.findByIdAndUpdate(chatId, {
            latestMessage: message,
        });

        return res.status(201).json({ message });

    } catch (error) {
        return res.status(400).json({
            message: `Caught an error while sending message: ${error.message}`,
        });
    }
});


const allMessages = asyncHandler(async (req, res) => {
    try {
        const messages = await Message.find({ chat: req.params.chatId })
            .populate("sender", "name profilePic email")
            .populate("chat")
            .populate("replyTo", "attachments content sender")
            .populate("readBy", "name profilePic email timestamps")

        return res
            .status(201)
            .json({
                messages
            })
    } catch (error) {
        return res
            .status(400)
            .json({
                "message": `caught error while fetching all messages for a chat ${error.message}`
            })
    }
});



export {
    sendMessage,
    allMessages,
}