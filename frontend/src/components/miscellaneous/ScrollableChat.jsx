import React, { useEffect, useRef } from 'react'
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarImage } from '../ui/avatar'
import { isSameUser, setSenderMargin } from '@/config/ChatLogic'
import { ChatState } from '@/Context/ChatProvider'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, } from "@/components/ui/tooltip"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu'
import RenderReplyPreview from './RenderReplyPreview'


const ScrollableChat = ({ messages }) => {
    const { user, darkMode, setReplyTo, selectedChat } = ChatState()
    const messagesEndRef = useRef(null);

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
                                        className={`block rounded-[0.5rem] px-2 pt-2 pb-1.5 text-black relative ${isSender ? "bg-[#BFA7FA]" : "bg-[#F0B99E]"}`}
                                        style={{
                                            wordBreak: "break-word",
                                            overflowWrap: "break-word",
                                            maxWidth: "90vw"
                                        }}
                                    >
                                        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <img
                                                        src={
                                                            darkMode
                                                                ? "src/public/dropdown_darkmode.png"
                                                                : "src/public/dropdown_lightmode.png"
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

                                                    {selectedChat.isGroupChat && <DropdownMenuItem
                                                        className={`px-6 py-3 cursor-pointer flex  items-center font-medium rounded-sm ${darkMode ? "hover:bg-slate-500 text-white" : "hover:bg-slate-300 text-black"
                                                            }`}
                                                    >
                                                        <span></span>
                                                        <span>Reply privately</span>
                                                    </DropdownMenuItem>}

                                                    <DropdownMenuItem
                                                        className={`px-6 py-3 cursor-pointer flex items-center font-medium rounded-sm ${darkMode ? "hover:bg-slate-500 text-white" : "hover:bg-slate-300 text-black"
                                                            }`}
                                                    >
                                                        <span></span>
                                                        <span>Message sender</span>
                                                    </DropdownMenuItem>

                                                    <DropdownMenuItem
                                                        className={`px-6 py-3 cursor-pointer flex items-center font-medium rounded-sm ${darkMode ? "hover:bg-slate-500 text-white" : "hover:bg-slate-300 text-black"
                                                            }`}
                                                    >
                                                        <span></span>
                                                        <span>Copy text</span>
                                                    </DropdownMenuItem>

                                                    <DropdownMenuItem
                                                        className={`px-6 py-3 cursor-pointer flex items-center font-medium rounded-sm ${darkMode ? "hover:bg-slate-500 text-white" : "hover:bg-slate-300 text-black"
                                                            }`}
                                                    >
                                                        <span></span>
                                                        <span>React</span>
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>

                                        {/* Reply Preview */}
                                        {currMessage.replyTo && RenderReplyPreview(currMessage.replyTo, darkMode)}

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

                                    <img
                                        src="src/public/reaction_darkmode.png"
                                        alt="Reaction"
                                        className={`hidden cursor-pointer group-hover:block absolute top-1/2 -translate-y-1/2 ${isSender ? "right-full mr-2" : "left-full ml-2"} w-5 h-5`}
                                    />
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
