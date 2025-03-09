import mongoose from "mongoose";


const messageModel = mongoose.Schema(
    {
        sender: {
            type: mongoose.Schema.ObjectId,
            ref: "User",
            required: true
        },
        content: {
            type: String,
            trim: true,
        },
        contentType: {
            type: String,
            enum: ["text", "image", "video", "audio", "document", "gif", "file"],
            default: "text"
        },
        attachments: [
            {
                url: {
                    type: String,
                    required: true
                },
                fileType: {
                    type: String,
                    enum: ["image", "video", "audio", "document", "gif", "file"]
                },
            }
        ],
        chat: {
            type: mongoose.Schema.ObjectId,
            ref: "Chat",
            required: true
        },
        readBy: [
            {
                type: mongoose.Schema.ObjectId,
                ref: "User"
            }
        ],
        replyTo: {
            type: mongoose.Schema.ObjectId,
            ref: "Message",
            default: null
        },
    },
    {
        timestamps: true,
    }
)

const Message = mongoose.model("Message", messageModel);

export { Message }
