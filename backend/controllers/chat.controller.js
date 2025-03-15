import { User } from "../models/user.model.js"
import { Chat } from "../models/chat.model.js"
import asyncHandler from "express-async-handler";
import { ApiError } from "../utils/ApiError.js";
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";



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
                    FullChat
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
                    .json({
                        result
                    })
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

    // step#1: take input : group name , users and groupIcon(if available)
    const { users, groupName } = req.body;
    const groupIcon = req.file ? req.file.path : "";

    console.log("groupIcon: ", groupIcon);

    let groupIconUrl = "https://res.cloudinary.com/du4bs9xd2/image/upload/v1742054125/default-group-image_szgp67.jpg";
    if (groupIcon) {
        // upload on cloudinary

        let groupIconUpload = await uploadOnCloudinary(groupIcon, req.file.filename);

        if (groupIcon && !groupIconUpload.secure_url) {
            throw new ApiError(500, "Something went wrong while uploading groupIcon pic on cloudinary");
        }
        console.log("groupIconUrl: ", groupIconUpload);
        groupIconUrl = groupIconUpload.secure_url;
    }

    if (!users || !groupName) {
        throw new ApiError(400, "A groupName and Group Participates required")
    }

    let allUsers = users.split(/[,\s]+/).filter(id => id.trim() !== "");
    console.log("allUsers: ", allUsers);

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
            groupAdmin: req.user,
            groupIcon: groupIconUrl.secure_url,
        });

        const createdGroupChat = await Chat.findOne({ _id: groupChat._id })
            .populate("users", "-password")
            .populate("groupAdmin", "-password");

        // step#4: return new groupChat
        return res
            .status(201)
            .json({
                createdGroupChat,
                message: "GroupChat created successfully"
            })

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
        .json({
            updatedChat
        })
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
            addUserUpdatedChat
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
            removeUserUpdatedChat
        )



});

const updateGroupIcon = asyncHandler(async (req, res) => {
    /*
     * step#1: check for GroupIcon given or not... ( from middleware )
     * step#2: upload new GroupIcon pic on cloudinary
     * step#3: delete old GroupIcon pic from cloudinary
     * step#4: update GroupIcon in Chat collection
     */

    // input: chatId
    const { chatId } = req.body;
    if (!chatId) {
        throw new ApiError(400, "ChatId not found")
    }

    // step#1: check for profilePicture given or not... ( from middleware )
    console.log("req.file: ", req.file);
    let groupIconPath = "";
    if (req.file) {
        groupIconPath = req.file.path;
    } else {
        throw new ApiError(400, "Profile pic not given")
    }
    console.log("pf path: ", groupIconPath);

    // step#2: upload new GroupIcon pic on cloudinary
    let groupIconPic = "";
    if (groupIconPath) {
        groupIconPic = await uploadOnCloudinary(groupIconPath, req.file.filename);
    }
    console.log("profilePic: ", groupIconPic);
    if (!groupIconPic || !groupIconPic.url) {
        throw new ApiError(500, "Something went wrong while updating profile pic");
    }

    // step#3: delete old GroupIcon pic from cloudinary

    const chat = await Chat.findById(chatId);
    console.log("chat: ", chat);
    if (!chat) {
        throw new ApiError(400, "Chat not found")
    }
    const prevPicture = chat.groupIcon;

    if (prevPicture && prevPicture !== "https://res.cloudinary.com/du4bs9xd2/image/upload/v1742054125/default-group-image_szgp67.jpg") {
        console.log("prevPicture: ", prevPicture);
        const deletePreviousPic = await deleteFromCloudinary(prevPicture);
        console.log("deletePreviousPic: ", deletePreviousPic);
        if (!deletePreviousPic) {
            console.log("previous pic cannot be deleted successfully");
        }
        else {
            console.log("previous pic deleted successfully");
        }
    }

    // step#4: update GroupIcon in Chat collection
    const updatedGroupChat = await Chat.findByIdAndUpdate(
        chatId,
        {
            groupIcon: groupIconPic.url
        },
        {
            new: true
        }
    )
        .populate("users", "-password")
        .populate("groupAdmin", "-password")

    if (!updateGroupIcon) {
        throw new ApiError(400, "GroupIcon not updated")
    }

    res
        .status(201)
        .json({
            updatedGroupChat
        })

});



export {
    accessChat,
    fetchChats,
    createGroupChat,
    renameGroup,
    addToGroup,
    removeFromGroup,
    updateGroupIcon,
} 