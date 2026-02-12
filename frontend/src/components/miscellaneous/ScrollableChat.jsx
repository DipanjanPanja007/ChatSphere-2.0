import React, { useEffect, useRef, useState } from 'react'
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarImage } from '../ui/avatar'
import { isSameUser, setSenderMargin } from '@/config/ChatLogic'
import { ChatState } from '@/Context/ChatProvider'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, } from "@/components/ui/tooltip"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu'
import { useToast } from '@/hooks/use-toast'
import axios from 'axios'
import EmojiPicker from 'emoji-picker-react'


const ScrollableChat = ({ messages, setMessages }) => {
    const { user, chats, darkMode, setReplyTo, selectedChat, setSelectedChat } = ChatState()
    const messagesEndRef = useRef(null);
    const { toast } = useToast();
    const [activeReactionPicker, setActiveReactionPicker] = useState(null);

    const accessChat = async (userId) => {
        try {
            // setLoadingChat(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${user.accessToken}`,
                    'Content-Type': 'application/json',
                }
            };

            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_URI}/api/chat`,
                { userId },
                config
            );

            console.log("Access Chat Response:", response.data);



            if (!chats.find((c) => c._id === response.data._id)) setChats([response.data, ...chats])

            setSelectedChat(response.data)


        } catch (error) {
            console.error("Error fetching chats:", error);
            toast({
                title: "Error occoured while fetching chats",
                variant: "error"
            });
        } finally {
            // setLoadingChat(false);
        }
    };

    const handleReaction = async (messageId, reaction) => {
        const config = {
            headers: {
                Authorization: `Bearer ${user.accessToken}`,
                'Content-Type': 'application/json',
            }
        };
        const response = await axios.put(
            `${import.meta.env.VITE_BACKEND_URI}/api/message/updateReaction`,
            {
                messageId,
                reaction
            },
            config
        )
        console.log("Reaction Response:", response);

        const updatedMessage = response.data.data;

        setMessages((prevMessages) =>
            prevMessages.map((msg) =>
                msg._id === updatedMessage._id
                    ? { ...msg, reactions: updatedMessage.reactions }
                    : msg
            )
        );

        setActiveReactionPicker(null);

    };



    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'instant' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    return (
        <div className="flex flex-col scroll-smooth h-full w-full">
            <ScrollArea className="px-2 w-full overflow-y-auto">
                {messages &&
                    messages.map((currMessage, index) => {
                        const isSender = currMessage.sender._id === user._id;
                        {/* console.log("Current Message:", currMessage); */ }
                        return (
                            <div
                                className={`flex w-full group relative ${isSender ? "justify-end" : "justify-start"}`}
                                key={currMessage._id}
                            >
                                {!isSender &&
                                    (index === messages.length - 1 ||
                                        messages[index + 1].sender._id !== currMessage.sender._id) && (
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger>
                                                    <Avatar className="m-1 mt-3 cursor-pointer w-8 h-8">
                                                        <AvatarImage src={currMessage.sender.profilePic} />
                                                    </Avatar>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>{currMessage.sender.name}</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    )}

                                <div
                                    className="relative max-w-[75%]"
                                    style={{
                                        marginLeft: !isSender
                                            ? setSenderMargin(messages, currMessage, index, user._id)
                                            : undefined,
                                        marginTop: isSameUser(messages, currMessage, index) ? "3px" : "10px",
                                    }}
                                >
                                    <div
                                        className={`block rounded-[0.5rem] px-2 pt-2 pb-1.5 text-black relative min-w-16 ${isSender ? "bg-[#BFA7FA]" : "bg-[#F0B99E]"}`}

                                        style={{
                                            wordBreak: "break-word",
                                            overflowWrap: "break-word",
                                            maxWidth: "90vw",
                                            minWidth: "7.5vw",
                                        }}
                                    >
                                        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <img
                                                        src={
                                                            darkMode
                                                                ? "/dropdown_darkmode.png"
                                                                : "/dropdown_lightmode.png"
                                                        }
                                                        className="w-5 cursor-pointer"
                                                        alt="V"
                                                    />
                                                </DropdownMenuTrigger>

                                                <DropdownMenuContent
                                                    className={`rounded-md p-1 ${darkMode ? "bg-gray-800 text-white" : "bg-white text-black shadow-md"}`}
                                                >
                                                    <DropdownMenuItem
                                                        className={`px-6 py-3 cursor-pointer flex items-center font-medium rounded-sm ${darkMode ? "hover:bg-slate-500 text-white" : "hover:bg-slate-300 text-black"
                                                            }`}
                                                        onClick={() => setReplyTo(currMessage)}
                                                    >
                                                        <span></span>
                                                        <span>Reply</span>
                                                    </DropdownMenuItem>

                                                    {(selectedChat.isGroupChat && currMessage.sender._id !== user._id) && <DropdownMenuItem
                                                        className={`px-6 py-3 cursor-pointer flex  items-center font-medium rounded-sm ${darkMode ? "hover:bg-slate-500 text-white" : "hover:bg-slate-300 text-black"
                                                            }`}
                                                        onClick={() => {
                                                            accessChat(currMessage.sender._id)
                                                            setReplyTo(currMessage)
                                                        }}
                                                    >
                                                        <span></span>
                                                        <span>Reply privately</span>
                                                    </DropdownMenuItem>}

                                                    {currMessage.sender._id !== user._id &&
                                                        <DropdownMenuItem
                                                            className={`px-6 py-3 cursor-pointer flex items-center font-medium rounded-sm ${darkMode ? "hover:bg-slate-500 text-white" : "hover:bg-slate-300 text-black"
                                                                }`}
                                                            onClick={() => accessChat(currMessage.sender._id)}
                                                        >
                                                            <span></span>
                                                            <span>Message sender</span>
                                                        </DropdownMenuItem>}

                                                    <DropdownMenuItem
                                                        className={`px-6 py-3 cursor-pointer flex items-center font-medium rounded-sm ${darkMode ? "hover:bg-slate-500 text-white" : "hover:bg-slate-300 text-black"
                                                            }`}
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(currMessage.content)
                                                                .then(() => {
                                                                    console.log("Text copied to clipboard");
                                                                    toast({
                                                                        title: "Message copied to clipboard",
                                                                        variant: "success"
                                                                    });
                                                                })
                                                                .catch((err) => {
                                                                    console.error("Failed to copy text: ", err);
                                                                    toast({
                                                                        title: "Can't copy text, try again",
                                                                        variant: "error"
                                                                    });
                                                                });
                                                        }}
                                                    >
                                                        <span></span>
                                                        <span>Copy text</span>
                                                    </DropdownMenuItem>

                                                    <DropdownMenuItem
                                                        className={`px-6 py-3 cursor-pointer flex items-center font-medium rounded-sm ${darkMode ? "hover:bg-slate-500 text-white" : "hover:bg-slate-300 text-black"
                                                            }`}
                                                        onClick={() => activeReactionPicker !== currMessage._id ? setActiveReactionPicker(currMessage._id) : setActiveReactionPicker(null)}
                                                    >
                                                        <span></span>
                                                        <span>React</span>
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>

                                        {/* Reply Preview */}
                                        {currMessage.replyTo && (
                                            <div
                                                className={`mb-1 p-2 rounded text-sm ${currMessage.sender._id === user._id ? "bg-violet-400" : "bg-orange-300"} cursor-pointer `}
                                            >
                                                <div className="font-semibold mb-1">
                                                    {
                                                        currMessage.replyTo.sender._id === user._id ? "You" : currMessage.replyTo.sender.name || "Unknown User"
                                                    }
                                                    {
                                                        currMessage.replyTo.chat._id !== selectedChat._id && ` - ${currMessage.replyTo.chat.chatName}`
                                                    }
                                                    {/* <span>{currMessage.replyTo.sender.name || "aaaa"}</span> */}
                                                </div>


                                                {currMessage.replyTo.attachments?.length > 0 && (
                                                    <div className="mt-1">
                                                        {currMessage.replyTo?.attachments?.[0]?.fileType === 'image' || currMessage.replyTo?.attachments?.[0]?.fileType === 'gif' ? (
                                                            <img
                                                                src={currMessage.replyTo.attachments[0].url}
                                                                className="max-w-[5rem] max-h-[5rem] rounded object-contain"
                                                                alt="reply media"
                                                            />
                                                        ) : currMessage.replyTo?.attachments?.[0]?.fileType === 'video' ? (
                                                            <div className="w-20 h-10 bg-black text-white text-xs flex items-center justify-center rounded">
                                                                Video file
                                                            </div>
                                                        ) : currMessage.replyTo?.attachments?.[0]?.fileType === 'audio' ? (
                                                            <div className="w-20 h-10 bg-gray-400 text-white text-xs flex items-center justify-center rounded">
                                                                Audio file
                                                            </div>
                                                        ) : (
                                                            <div className="text-xs text-blue-600 underline break-all">
                                                                {currMessage.replyTo.attachments[0].fileType || 'file'}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                                {currMessage.replyTo.content && (
                                                    <div className="italic line-clamp-2">{currMessage.replyTo.content}</div>
                                                )}
                                            </div>
                                        )}

                                        {/* Attachments */}
                                        {currMessage.attachments?.length > 0 && (
                                            <div className="space-y-2 mb-2 w-full max-w-[90vw]">
                                                {currMessage.attachments.map((file, i) => {
                                                    const type = file.fileType;

                                                    if (type === "image" || type === "gif") {
                                                        return (
                                                            <img key={i} src={file.url} className="w-full max-w-xs rounded-md object-contain" />
                                                        );
                                                    }

                                                    if (type === "video") {
                                                        return (
                                                            <video key={i} controls className="w-full max-w-xs rounded-md">
                                                                <source src={file.url} type="video/mp4" />
                                                            </video>
                                                        );
                                                    }

                                                    if (type === "audio" || file.url.endsWith(".mp3") || file.url.endsWith(".wav")) {
                                                        return (
                                                            <audio key={i} controls className="min-w-[80rem]" style={{ minWidth: "50%", maxWidth: "100%" }}>
                                                                <source src={file.url} />
                                                            </audio>
                                                        );
                                                    }

                                                    return (
                                                        <a
                                                            key={i}
                                                            href={file.url}
                                                            download
                                                            className="block text-sm text-blue-600 underline break-words"
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                        >
                                                            Download {file.fileType || 'file'}
                                                        </a>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        {/* message sending time */}
                                        <div className="flex justify-between items-end gap-2">
                                            <div className="flex-1 break-words">{currMessage.content}</div>
                                            <span className="text-[10px] text-gray-700 whitespace-nowrap">
                                                {new Date(currMessage.createdAt).toLocaleTimeString([], {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                    hour12: false,
                                                })}
                                            </span>
                                        </div>
                                    </div>

                                    {/* reaction image */}
                                    <img
                                        src="/reaction_darkmode.png"
                                        alt="Reaction"
                                        className={`hidden cursor-pointer group-hover:block absolute top-1/2 -translate-y-1/2 ${isSender ? "right-full mr-2" : "left-full ml-2"} w-5 h-5`}
                                        onClick={() => activeReactionPicker !== currMessage._id ? setActiveReactionPicker(currMessage._id) : setActiveReactionPicker(null)}
                                    />
                                    {activeReactionPicker === currMessage._id && (
                                        <div
                                            className={`absolute z-50 max-w-[90vw]`}
                                            style={{
                                                top: "100%",
                                                left: isSender ? "auto" : "0",
                                                right: isSender ? "0" : "auto",
                                                maxWidth: 'calc(100vw - 1rem)',
                                                overflow: 'hidden',
                                            }}
                                        >
                                            <EmojiPicker
                                                height={350}
                                                width={300}
                                                onEmojiClick={(emojiData) =>
                                                    handleReaction(currMessage._id, emojiData.emoji)
                                                }
                                            />
                                        </div>
                                    )}

                                    {/* display reactions  */}
                                    {currMessage.reactions && currMessage.reactions.length > 0 && (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger>
                                                <div className="flex items-center gap-0 -mt-2 mx-1 relative z-10 cursor-pointer">
                                                    {currMessage.reactions.slice(0, 3).map((r, i) => (
                                                        <span
                                                            key={i}
                                                            className={`text-sm p-0`}
                                                        >
                                                            {r.reaction}
                                                        </span>
                                                    ))}

                                                    {currMessage.reactions.length > 3 && (
                                                        <span className="text-md pr-0.5 ">...</span>
                                                    )}
                                                </div>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent className='bg-slate-500'>
                                                <div className="flex flex-col gap-1 mt-2">
                                                    {currMessage.reactions.map((reaction, idx) => (
                                                        <DropdownMenuItem
                                                            key={idx}
                                                            className="flex items-center justify-between w-full max-w-xs rounded-xl bg-[#1f1f1f] px-3 py-2 shadow-md border border-gray-700 text-white"
                                                            onClick={() => reaction.userId._id === user._id && handleReaction(currMessage._id, reaction.reaction)}
                                                        >
                                                            {/* Left: Profile + Name */}
                                                            <div className="flex items-center gap-2">
                                                                <img
                                                                    src={reaction.userId.profilePic}
                                                                    alt={reaction.userId.name}
                                                                    className="w-8 h-8 rounded-full object-cover"
                                                                />
                                                                <div className="flex flex-col">
                                                                    <span className="text-sm font-semibold truncate max-w-[7rem]">
                                                                        {reaction.userId._id === user._id ? "You" : reaction.userId.name}
                                                                    </span>
                                                                    {reaction.userId._id === user._id && <span className="text-xs text-gray-400">Click to remove</span>}
                                                                </div>
                                                            </div>

                                                            {/* Right: Emoji */}
                                                            <div className="text-2xl">{reaction.reaction}</div>
                                                        </DropdownMenuItem>

                                                    ))}
                                                </div>

                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                <div ref={messagesEndRef} />
            </ScrollArea>
        </div>
    );
};

export default ScrollableChat;
