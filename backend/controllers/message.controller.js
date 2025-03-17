import asyncHandler from "express-async-handler";
import { Message } from "../models/message.model.js"
import { User } from "../models/user.model.js"
import { Chat } from "../models/chat.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const sendMessage = asyncHandler(async (req, res) => {
    // content, chatId, replyTo input from body
    const { content, chatId, replyTo } = req.body;

    let attachments = [];

    // if media file is given, take it and upload on cloudinary
    if (req.files.length > 0) {
        console.log("req.files: ", req.files);

        // Upload each file to Cloudinary
        const uploadPromises = req.files.map(file => (
            // console.log("file type", file.mimetype),
            uploadOnCloudinary(file.path, file.filename))
        );

        const uploadedFileURLs = await Promise.all(uploadPromises);
        console.log("uploadedFileURLs", uploadedFileURLs);

        if (uploadedFileURLs.length > 0) {
            attachments = uploadedFileURLs.map((fileURL, index) => ({
                url: fileURL,
                type: req.files[index].mimetype.split("/")[0],
            }));
        }
    }

    if ((!content && attachments.length == 0) || !chatId) {
        return res
            .status(400)
            .json({
                message: "chatId and content both are required"
            })
    }

    let newMessage = {
        sender: req.user._id,
        content: content,
        attachments: attachments,
        chat: chatId,
        replyTo: replyTo,
        readBy: [req.user._id],
    }

    try {
        var message = await Message.create(newMessage)

        message = await message
            .populate([
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
        })

        await Chat.findByIdAndUpdate(req.body.chatId, {
            latestMessage: message,
        })

        console.log('message', message);

        res
            .status(201)
            .json({
                message
            })

    } catch (error) {
        res
            .status(400)
            .json({
                message: `Caught an error while sending message: ${error.message}`
            })
    }
})

const allMessages = asyncHandler(async (req, res) => {
    try {
        const messages = await Message.find({ chat: req.params.chatId })
            .populate("sender", "name profilePic email")
            .populate("chat")

        res
            .status(201)
            .json({
                messages
            })
    } catch (error) {
        res
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