import { User } from "../models/user.model.js"
import { Chat } from "../models/chat.model.js"
import asyncHandler from "express-async-handler";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";



const accessChat = asyncHandler(async (req, res) => {
    /*
     * step#1: you can access user object due to verified User only allowed (verifyJWT)
     * step#2: provided userId of 2nd person( with whom you will chat )
     * step#3: if Chat object found with users you and 2nd person, send it after removing credentials/secrets
     * step#4: if Chat not found, create one and send it after removing credentials
     */

    // step#2: provided userId of 2nd person( with whom you will chat )
    const { userId } = req.body;

    if (!userId) {
        throw new ApiError(400, "UserId not found to chat with ... ")
    }

    // step#3: search for chat with 2nd person
    let isChat = await Chat.find({
        isGroupChat: false,
        $and: [
            { users: { $elemMatch: { $eq: req.user._id } } },
            { users: { $elemMatch: { $eq: userId } } },
        ]
    }).populate("users", "-password")                   // removing credentials/secrets
        .populate("latestMessage")

    isChat = await User.populate(isChat, {
        path: "latestMessage.sender",
        select: "name profilePic email",
    });

    // if chat present, send it
    if (isChat.length > 0) {
        res.send(isChat[0]);
    } else {
        // step#4: Chat not found, create one and send it after removing credentials
        const chatData = {
            chatName: "sender",
            isGroupChat: false,
            users: [req.user._id, userId],        // my_id , 2ndPerson_id
        }

        try {
            const createChat = await Chat.create(chatData);
            const FullChat = await Chat.findOne({ _id: createChat._id }).populate(
                "users",
                "-password"
            );
            res.status(200).json(FullChat);
            return res
                .status(201)
                .json(
                    new ApiResponse(
                        200,
                        FullChat
                    )
                )
        } catch (error) {
            throw new ApiError(
                400,
                `something went wrong while creating new chat ${error?.message}`
            )
        }

    }

});


const fetchChats = asyncHandler(async (req, res) => {

    /*
     * step#1: find all chats with me: search chats with user as me
     * step#2: populate users, groupAdmin, latestMessage and return result removing credentials
     */

    try {
        Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
            .populate("users", "-password")
            .populate("groupAdmin", "-password")
            .populate("latestMessage")
            .sort({ updatedAt: -1 })
            .then(async (result) => {
                return res
                    .status(201)
                    .json(
                        new ApiResponse(
                            201,
                            result
                        )
                    )
            })
    } catch (error) {
        throw new ApiError(400, `Error from fetchChats : ${error.message}`)
    }
});

const createGroupChat = asyncHandler(async (req, res) => {
    /*
     * step#1: take input : group name and users
     * step#2: add yourself and check group count condition 
     * step#3: create a new Group Chat object , populate.., remove credentials...
     * step#4: return new groupChat
     */

    // step#1: take input : group name and users
    const { users, groupName } = req.body;
    if (!users || !groupName) {
        throw new ApiError(400, "A groupName and Group Participates required")
    }

    let allUsers = JSON.parse(users);

    if (allUsers.length < 2) {
        throw new ApiError(400, `You need atleast ${2 - allUsers.length} participates to create a group `)
    }

    // step#2: add yourself
    allUsers.push(req.user);

    try {
        // step#3: create a new Group Chat object , populate.., remove credentials...
        const groupChat = await Chat.create({
            chatName: groupName,
            users: allUsers,
            isGroupChat: true,
            groupAdmin: req.user
        });

        const createdGroupChat = await Chat.findOne({ _id: groupChat._id })
            .populate("users", "-password")
            .populate("groupAdmin", "-password");

        // step#4: return new groupChat
        return res
            .status(201)
            .json(
                new ApiResponse(
                    201,
                    createdGroupChat
                )
            )

    } catch (error) {
        throw new ApiError(400, `Something went wrong while creating GroupChat: ${error.message}`)
    }

});

const renameGroup = asyncHandler(async (req, res) => {

    /*
     * step#1: take input chatId and updatedChatName
     * step#2: find the chat and update, populate..., and send 
     */

    const { chatId, newChatName } = req.body;

    if ([chatId, newChatName].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required...");
    }

    const updatedChat = await Chat.findByIdAndUpdate(
        chatId,
        {
            chatName: newChatName
        },
        {
            new: true,                      // sothat it will send the updated one
        }
    )
        .populate("users", "-password")
        .populate("groupAdmin", "-password")

    if (!updatedChat) {
        throw new ApiError(400, `GroupChat name not updated `)
    }

    res
        .status(201)
        .json(
            new ApiResponse(
                201,
                updatedChat
            )
        )
});


const addToGroup = asyncHandler(async (req, res) => {
    /*
     * step#1: take input chatId and userId (whom to add)
     * step#2: find the chat and update, populate..., and send 
     */

    const { chatId, userId } = req.body;

    if ([chatId, userId].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required...");
    }

    const addUserUpdatedChat = await Chat.findByIdAndUpdate(
        chatId,
        {
            $push: { users: userId }
        },
        {
            new: true,
        }
    )
        .populate("users", "-password")
        .populate("groupAdmin", "-password")
    if (!addUserUpdatedChat) {
        throw new ApiError(400, `GroupChat name not updated `)
    }

    res
        .status(201)
        .json(
            new ApiResponse(
                201,
                addUserUpdatedChat
            )
        )
});


const removeFromGroup = asyncHandler(async (req, res) => {
    /*
     * step#1: take input chatId and userId (whom to add)
     * step#2: find the chat and update, populate..., and send 
     */

    const { chatId, userId } = req.body;

    if ([chatId, userId].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required...");
    }

    const removeUserUpdatedChat = await Chat.findByIdAndUpdate(
        chatId,
        {
            $pull: { users: userId }
        },
        {
            new: true,
        }
    )
        .populate("users", "-password")
        .populate("groupAdmin", "-password")
    if (!removeUserUpdatedChat) {
        throw new ApiError(400, `GroupChat name not updated `)
    }

    res
        .status(201)
        .json(
            new ApiResponse(
                201,
                removeUserUpdatedChat
            )
        )



});




export {
    accessChat,
    fetchChats,
    createGroupChat,
    renameGroup,
    addToGroup,
    removeFromGroup,
} 