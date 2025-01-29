import { getSender, getSenderFull } from '@/config/ChatLogic';
import { ChatState } from '@/Context/ChatProvider';
import { useToast } from '@/hooks/use-toast';
import React, { useEffect, useRef, useState } from 'react';
import UpdateGroupChatModal from './UpdateGroupChatModal';
import ProfileModal from './ProfileModal';
import { io } from 'socket.io-client';
import ScrollableChat from './ScrollableChat.jsx';
import { Input } from '../ui/input';
import axios from 'axios';

const ENDPOINT = import.meta.env.VITE_BACKEND_URI;
let socket, selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
    const inputRef = useRef(null);
    const { toast } = useToast();
    const { user, selectedChat, setSelectedChat, notification, setNotification } = ChatState();
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [newMessage, setNewMessage] = useState('');
    const [socketConnected, setSocketConnected] = useState(false);
    const [typing, setTyping] = useState(false);
    const [isTyping, setIsTyping] = useState(false);

    // Escape key to exit chat
    useEffect(() => {
        const handleEscKey = (event) => {
            if (event.key === 'Escape') {
                setSelectedChat('');
            }
        };

        window.addEventListener('keydown', handleEscKey);

        return () => {
            setNewMessage('');
            window.removeEventListener('keydown', handleEscKey);
        };
    }, [setSelectedChat]);

    // Socket setup
    useEffect(() => {
        socket = io(ENDPOINT);
        socket.emit('setup', user.data.user);
        socket.on('connected', () => setSocketConnected(true));

        // socket.on("typing", () => setIsTyping(true));
        // socket.on('stop_typing', () => setIsTyping(false));

        socket.on("typing", (room) => {
            // console.log("typing");
            // console.log("selectedChat:", selectedChat);

            if (room === selectedChat._id) {
                setIsTyping(true);
            }
        });
        socket.on("stop_typing", (room) => {
            // console.log("stop typing");
            // console.log("selectedChat:", selectedChat);
            if (room === selectedChat._id) {
                setIsTyping(false);
            }
        });

        return () => {
            socket.disconnect(); // Clean up on unmount
        };
    }, [user, selectedChat]);



    // Fetch messages when a chat is selected and remove notificaiton of that chat
    useEffect(() => {
        if (selectedChat) {
            fetchMessages();
            selectedChatCompare = selectedChat;
            socket.emit('join_chat', selectedChat._id);
            if (inputRef.current) {
                inputRef.current.focus();
            }
        }
        // Remove notification of the selected chat
        if (notification.length > 0) {
            setNotification((prevNotifications) => prevNotifications.filter(noti => noti.chat._id !== selectedChat._id));
        }

    }, [selectedChat]);

    // Handle incoming messages and notifications
    useEffect(() => {
        const messageListener = (newMessageReceived) => {
            // console.log("newMessageReceived:", newMessageReceived.chat._id);
            // console.log("notification->array->chatid:", notification[0]?.chat._id);
            if (!selectedChatCompare || selectedChatCompare._id !== newMessageReceived.chat._id) {
                // Notification logic
                if (!notification.find((msg) => msg._id === newMessageReceived._id)) {
                    // add latest notification to the top and remove the previous notification of the same chat
                    setNotification((prevNotifications) => [
                        newMessageReceived,
                        ...prevNotifications.filter((msg) => msg.chat._id !== newMessageReceived.chat._id)
                    ]);
                    setFetchAgain((prev) => !prev);
                }

            } else {
                setMessages((prev) => [...prev, newMessageReceived]);
            }
        };

        socket.on("message_recieved", messageListener);

        // Cleanup function for this effect
        return () => {
            socket.off("message_recieved", messageListener);
        };
    }, [selectedChat, notification, fetchAgain, messages, newMessage]);

    // Handle typing logic
    const typingHandler = (e) => {
        setNewMessage(e.target.value);

        if (!socketConnected) return;

        if (!typing) {
            setTyping(true);
            socket.emit('typing', selectedChat._id);
        }

        let lastTypingTime = new Date().getTime();
        const timerLength = 3000;

        setTimeout(() => {
            const timeNow = new Date().getTime();
            if (timeNow - lastTypingTime >= timerLength && typing) {
                socket.emit('stop_typing', selectedChat._id);
                setTyping(false);
            }
        }, timerLength);
    };

    // Send message
    const sendMessage = async (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();

            if (newMessage.trim() === '') {
                toast({
                    title: "Message can't be empty",
                });
                return;
            }

            socket.emit('stop_typing', selectedChat._id);

            try {
                setNewMessage('');
                const { data } = await axios.post(
                    `${ENDPOINT}/api/message`,
                    {
                        content: newMessage,
                        chatId: selectedChat._id,
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${user.data.accessToken}`,
                        },
                    }
                );

                socket.emit('new_message', data.data);
                setMessages((prev) => [...prev, data.data]);
            } catch (error) {
                toast({
                    title: 'Error occurred while sending message',
                    variant: 'error',
                });
                console.error(`Error: ${error.message}`);
            }
        }
    };

    // Fetch messages for the selected chat
    const fetchMessages = async () => {
        if (!selectedChat) return;

        try {
            setLoading(true);
            const { data } = await axios.get(`${ENDPOINT}/api/message/${selectedChat._id}`, {
                headers: {
                    Authorization: `Bearer ${user.data.accessToken}`,
                },
            });
            setMessages(data.data);
            setLoading(false);
        } catch (error) {
            toast({
                title: 'Error occurred while fetching chat messages',
                variant: 'error',
            });
            console.error(`Error: ${error.message}`);
        }
    };

    return (
        <>
            {selectedChat ? (
                <>
                    {/* Chat Header */}
                    <div className="text-[24px] max-md:text-[28px] w-full mb-2 px-2 font-sans flex items-center justify-between align-middle">
                        <button
                            className="flex md:hidden py-2 px-3 bg-slate-300 hover:bg-slate-400 rounded-md"
                            onClick={() => setSelectedChat('')}
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
                    <div className="flex flex-col justify-between w-full h-[91%] rounded-lg p-3 bg-gray-100">
                        {/* Chat Messages Container */}
                        <div className="flex mb-3 overflow-y-auto">
                            {loading ? <>Loading Chats...</> : <ScrollableChat messages={messages} />}
                        </div>

                        {/* Input Field */}
                        <form onKeyDown={sendMessage} className="bg-slate-100 rounded-sm">
                            {isTyping ? <div>Typing...</div> : null}
                            <Input
                                variant={'filled'}
                                className="bg-white p-2"
                                placeholder="Type a message..."
                                onChange={typingHandler}
                                value={newMessage}
                                ref={inputRef}
                                autoFocus
                            />
                        </form>
                    </div>
                </>
            ) : (
                <div className="flex items-center justify-center h-full">
                    <span className="text-3xl font-sans pb-3">Click on a user to start chatting</span>
                </div>
            )}
        </>
    );
};

export default SingleChat;
