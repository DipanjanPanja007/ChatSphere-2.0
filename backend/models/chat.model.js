/*
 * Content: 
 * chatName
 * isGroupChat
 * users
 * latestMessage
 * groupAdmin
 */

import mongoose from "mongoose";

const chatModel = mongoose.Schema(
    {
        chatName: {
            type: String,
            trim: true,
        },
        isGroupChat: {
            type: Boolean,
            default: false,
        },
        // for one-to-one chat, in users array, there will be 1 users, for group, >2
        users: [
            {
                type: mongoose.Types.ObjectId,
                ref: "User",
            }
        ],
        latestMessage: {
            type: mongoose.Types.ObjectId,
            ref: "Message",
        },
        groupAdmin: {
            type: mongoose.Types.ObjectId,
            ref: "User",
        }
    },
    {
        timestamps: true
    }
)

const Chat = mongoose.model("Chat", chatModel);
export { Chat };
