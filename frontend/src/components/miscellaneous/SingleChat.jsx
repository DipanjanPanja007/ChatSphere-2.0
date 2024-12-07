import { getSender, getSenderFull } from '@/config/ChatLogic';
import { ChatState } from '@/Context/ChatProvider';
import { useToast } from '@/hooks/use-toast';
import React, { useEffect, useState } from 'react'
import UpdateGroupChatModal from './UpdateGroupChatModal';
import ProfileModal from './ProfileModal';
import { io } from 'socket.io-client';
import ScrollableChat from './ScrollableChat.jsx';
import { Input } from '../ui/input';
import axios from 'axios';


const ENDPOINT = import.meta.env.VITE_BACKEND_URI;
let socket, selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {

    const { toast } = useToast();
    const { user, selectedChat, setSelectedChat, notification, setNotification } = ChatState();
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [newMessage, setNewMessage] = useState();
    const [socketConnected, setSocketConnected] = useState(false);
    const [typing, setTyping] = useState(false);
    const [isTyping, setIsTyping] = useState(false);


    useEffect(() => {
        socket = io(ENDPOINT)
        socket.emit("setup", user.data.user);
        socket.on("connected", () => setSocketConnected(true))
        socket.on("typing", () => setIsTyping(true))
        socket.on("stop_typing", () => setIsTyping(false))
    }, [])

    useEffect(() => {
        fetchMessages();
        selectedChatCompare = selectedChat;          // for notification/show logic...
    }, [selectedChat])

    useEffect(() => {
        socket.on("message_recieved", (newMessageReceived) => {
            if (!selectedChatCompare || selectedChatCompare._id !== newMessageReceived.chat._id) {
                // give notification
                if (!notification.includes(newMessageReceived)) {
                    setNotification([newMessageReceived, ...notification])
                    setFetchAgain(!fetchAgain)
                }
            }
            else {
                setMessages([...messages, newMessageReceived])
            }
        });

        // to escape from a chat, just press esc key
        const handleEscKey = (event) => {
            if (event.key === "Escape") {
                setSelectedChat("");
            }
        };

        // Add event listener for keydown
        window.addEventListener("keydown", handleEscKey);

        return () => {
            window.removeEventListener("keydown", handleEscKey);
        };
    });


    const typingHandler = async (e) => {
        setNewMessage(e.target.value);

        // typing indecator logic

        if (!socketConnected) return;

        if (!typing) {
            setTyping(true)                                  // here i am setting it true 'cause typingHandler is triggered wherever typing has started
            socket.emit("typing", selectedChat._id)
        }

        let lastTypingTime = new Date().getTime();
        let timerLength = 3000;
        setTimeout(() => {
            let timeNow = new Date().getTime();
            let timediff = timeNow - lastTypingTime
            if (timediff >= timerLength && typing) {
                socket.emit("stop_typing", selectedChat._id)
                setTyping(false)
            }
        }, timerLength);
    }


    const sendMessage = async (event) => {
        if (event.key === "Enter" && newMessage.trim()) {
            socket.emit("stop_typing", selectedChat._id)
            try {
                setNewMessage("")
                const { data } = await axios.post(`${import.meta.env.VITE_BACKEND_URI}/api/message`, {
                    content: newMessage,
                    chatId: selectedChat._id,
                }, {
                    headers: {
                        Authorization: `Bearer ${user.data.accessToken}`,
                        'Content-Type': 'application/json',
                    },
                    credentials: "include",
                });

                socket.emit('new_message', data.data)

                setMessages([...messages, data.data])


            } catch (error) {
                toast({
                    title: "Error occoured while sending message",
                    variant: "error",
                })
                console.log(`error message: ${error.message}`);

            }
        }
    }

    const fetchMessages = async () => {
        if (!selectedChat) return;

        try {
            setLoading(true)
            const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URI}/api/message/${selectedChat._id}`, {
                headers: {
                    Authorization: `Bearer ${user.data.accessToken}`
                }
            });
            setMessages(data.data)
            setLoading(false)
            socket.emit("join_chat", selectedChat._id)

        } catch (error) {
            toast({
                title: "Error occoured while fetching particular chat message",
                variant: "error",
            })
            console.log(`error is: ${error.message}`);

        }
    }



    return (
        <>
            {
                selectedChat ? (
                    <>
                        {/* Chat Header */}
                        <div
                            className="text-[24px] max-md:text-[28px] px-2 w-full font-sans flex items-center justify-between align-middle"
                        >
                            <button
                                className="flex md:hidden p-2 bg-slate-400 hover:bg-slate-500 "
                                onClick={() => setSelectedChat("")}
                            >
                                <i className="fa-solid fa-arrow-left"></i>
                            </button>
                            {!selectedChat.isGroupChat ? (
                                <>
                                    {getSender(user, selectedChat.users)}
                                    <ProfileModal user={getSenderFull(user, selectedChat.users)} />
                                </>
                            ) : (
                                <>
                                    {selectedChat.chatName.toUpperCase()}
                                    <UpdateGroupChatModal
                                        fetchAgain={fetchAgain}
                                        setFetchAgain={setFetchAgain}
                                        fetchMessages={fetchMessages}
                                    />
                                </>
                            )}
                        </div>


                        {/* Main Chat Container */}
                        <div
                            className="flex flex-col justify-between w-full h-[93%] rounded-lg p-3 bg-gray-100"
                        >
                            {/* Chat Messages Container */}
                            <div className='flex mb-3 overflow-y-auto'>
                                {loading ? (
                                    <>Loading Chats .....</>
                                ) : (
                                    <ScrollableChat messages={messages} />
                                )}
                            </div>

                            {/* Input Field */}
                            <form onKeyDown={sendMessage} isRequired className='bg-slate-100 rounded-sm' >
                                {isTyping ? (
                                    <div>Typing....</div>
                                ) : null}
                                <Input
                                    variant={"filled"}
                                    backgroundColor={"#C2C2C2"}
                                    placeholder="Kuch lik na...."
                                    onChange={typingHandler}
                                    value={newMessage}
                                />
                            </form>

                        </div>

                    </>
                ) : (
                    <div className='flex items-center justify-center h-full'>
                        <span className='text-3xl font-sans pb-3'>
                            Click on a user to start chatting
                        </span>
                    </div>
                )
            }
        </>
    )
}

export default SingleChat
