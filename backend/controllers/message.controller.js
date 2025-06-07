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

const addReaction = asyncHandler(async (req, res) => {

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
            // step#4: if user already reacted, update the reaction
            existingReaction.reaction = reaction;
        } else {
            // step#5: if user has not reacted, push the reaction to the message's reactions array
            message.reactions.push({
                userId: req.user._id,
                reaction,
            });
        }

        await message.save();

        return res.status(200).json({
            message: "Reaction updated successfully",
            data: message,
        });
    } catch (error) {
        return res.status(500).json({
            message: `Error updating reaction: ${error.message}`,
        });
    }
});

const removeReaction = asyncHandler(async (req, res) => {

    /**
     * step#1: Extract messageId and reaction from request body
     * step#2: Validate that messageId and reaction are provided
     * step#3: FindById the message by messageId AndUpdate as pull the reaction with userId
     */

    // step#1: Extract messageId and reaction from request body
    const { messageId, reaction } = req.body;

    // step#2: Validate that messageId and reaction are provided
    if (!messageId || !reaction) {
        return res.status(400).json({
            message: "messageId is required",
        });
    }

    try {

        // step#3: FindById the message by messageId AndUpdate as pull the reaction with userId
        const updatedMessage = await Message.findByIdAndUpdate(
            messageId,
            {
                $pull: {
                    reactions: { userId: req.user._id }
                }
            },
            { new: true }
        )
        if (!updatedMessage) {
            return res.status(404).json({
                message: "Message not found",
            });
        }
        return res.status(200).json({
            message: "Reaction removed successfully",
            data: updatedMessage,
        });

    } catch (error) {
        return res.status(500).json({
            message: `Error removing reaction: ${error.message}`,
        });

    }

});



export {
    sendMessage,
    allMessages,
    addReaction,
    removeReaction
}