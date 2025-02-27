import asyncHandler from "express-async-handler";
import { Message } from "../models/message.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js";
import { Chat } from "../models/chat.model.js";

const sendMessage = asyncHandler(async (req, res) => {
    const { content, chatId } = req.body;

    if (!content || !chatId) {
        return res
            .status(400)
            .json({
                "message": "chatId and content both are required"
            })
    }

    let newMessage = {
        sender: req.user._id,
        content: content,
        chat: chatId,
    }

    try {
        var message = await Message.create(newMessage)

        message = await message.populate("sender", "name profilePic")

        message = await message.populate("chat")

        message = await User.populate(message, {
            path: "chat.users",
            select: "name profilePic email",
        });

        message = await Message.populate(message, {
            path: "chat.latestMessage"
        })

        await Chat.findByIdAndUpdate(req.body.chatId, {
            latestMessage: message,
        })

        return res
            .status(201)
            .json({
                message
            })

    } catch (error) {
        throw new ApiError(400, `Caught an error while sending message: ${error.message}`)
    }
})

const allMessages = asyncHandler(async (req, res) => {
    try {
        const messages = await Message.find({ chat: req.params.chatId })
            .populate("sender", "name profilePic email")
            .populate("chat")

        return res
            .status(201)
            .json({
                messages
            })
    } catch (error) {
        throw new ApiError(400, `caught error while fetching all messages for a chat ${error.message}`)
    }
})

export {
    sendMessage,
    allMessages,
}