import React, { useEffect, useState } from "react";
import { ChatState } from "../../Context/ChatProvider";

import axios from "axios";
import { getSender } from "../../config/ChatLogic.js";
import GroupChatModal from "./GroupChatModal.jsx";
import Loading from "./Loading";
import { ScrollArea } from "@/components/ui/scroll-area"


const MyChats = ({ fetchAgain }) => {
    const { selectedChat, setSelectedChat, chats, setChats, user } = ChatState();

    const [toastMessage, setToastMessage] = useState("");

    const fetchChats = async () => {
        try {
            const { data } = await axios.get(
                `${import.meta.env.VITE_BACKEND_URI}/api/chat`,
                {
                    headers: {
                        Authorization: `Bearer ${user.data.accessToken}`,
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                }
            );

            setChats(data.data);
        } catch (error) {
            setToastMessage("Failed to Load the chats");
        }
    };

    useEffect(() => {
        fetchChats();
    }, [fetchAgain]);

    return (
        <div
            className={`${selectedChat ? "hidden md:flex" : "flex"
                } flex-col items-center p-3 bg-white w-full h-full rounded-lg border border-gray-300`}
        >
            {/* Header */}
            <div className="flex items-center justify-between w-full pb-3 px-3 text-3xl max-md:text-xl font-medium ">
                <span>My Chats</span>
                <GroupChatModal>
                    <button className="flex items-center text-[1rem] font-medium px-6 py-1 rounded-lg bg-gray-200 hover:bg-teal-600 hover:text-white">
                        New Group Chat <i className="fa-solid fa-plus ml-2"></i>
                    </button>
                </GroupChatModal>
            </div>

            {/* Chat List */}
            <ScrollArea className="flex flex-col p-3 bg-gray-100 w-full h-full rounded-lg overflow-y-auto">
                <div className="flex flex-col p-3 bg-gray-100 w-full h-full rounded-lg overflow-y-auto">
                    {chats ? (
                        <div className="flex flex-col space-y-2">
                            {chats.map((chat) => (
                                <div
                                    key={chat._id}
                                    onClick={() => setSelectedChat(chat)}
                                    className={`cursor-pointer px-3 py-2 rounded-lg ${selectedChat === chat
                                        ? "bg-teal-500 text-white"
                                        : "bg-gray-200 text-black"
                                        }`}
                                >
                                    <span>
                                        {chat.isGroupChat
                                            ? chat.chatName
                                            : getSender(user, chat.users)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <Loading />
                    )}
                </div>

                {/* Toast */}
                {toastMessage && (
                    <div className="fixed bottom-5 left-5 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
                        {toastMessage}
                    </div>
                )}
            </ScrollArea>
        </div>
    );
};

export default MyChats;

