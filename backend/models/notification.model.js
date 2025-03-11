import mongoose from "mongoose";

const notificationSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Types.ObjectId,
            ref: "User",
            required: true
        },
        chat: {
            type: mongoose.Types.ObjectId,
            ref: "Chat",
            required: true
        },
        unseenMessages: {
            type: Number,
            default: 0
        },
        lastMessage: {
            type: mongoose.Types.ObjectId,
            ref: "Message"
        },
        sender: {
            type: mongoose.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    {
        timestamps: true,
    }
);

const Notification = mongoose.model("Notification", notificationSchema);

export { Notification };
