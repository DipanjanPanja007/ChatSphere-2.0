import React, { useEffect, useRef } from 'react'
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarImage } from '../ui/avatar'
import { isSameUser, setSenderMargin } from '@/config/ChatLogic'
import { ChatState } from '@/Context/ChatProvider'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, } from "@/components/ui/tooltip"

const ScrollableChat = ({ messages }) => {
    const { user, darkMode } = ChatState()
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
                    messages.map((currMessage, index) => (
                        <div
                            className={`flex w-full ${currMessage.sender._id === user._id ? "justify-end" : "justify-start"}`}
                            key={currMessage._id}
                        >
                            {/* Avatar logic */}
                            {currMessage.sender._id !== user._id &&
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

                            {/* Message bubble */}
                            <div
                                className="relative group max-w-[75%]"
                                style={{
                                    marginLeft:
                                        currMessage.sender._id !== user._id
                                            ? setSenderMargin(messages, currMessage, index, user._id)
                                            : undefined,
                                    marginTop: isSameUser(messages, currMessage, index) ? "3px" : "10px",
                                }}
                            >
                                {/* Dropdown Icon - appears on hover */}

                                <div className="relative group w-fit max-w-[90vw]">
                                    {/* Message bubble */}
                                    <div
                                        className={`block rounded-[0.5rem] px-2 pt-2 pb-1.5 text-black ${currMessage.sender._id === user._id ? "bg-[#BFA7FA]" : "bg-[#F0B99E]"}`}
                                        style={{
                                            wordBreak: "break-word",
                                            overflowWrap: "break-word",
                                            maxWidth: "90vw"
                                        }}
                                    >


                                        {/* Attachments */}
                                        {currMessage.attachments?.length > 0 && (
                                            <div className="space-y-2 mb-2 w-full max-w-[90vw]">
                                                {currMessage.attachments.map((file, i) => {
                                                    const type = file.fileType;

                                                    if (type === "image" || type === "gif") {
                                                        return (
                                                            <img
                                                                key={i}
                                                                src={file.url}
                                                                alt={`attachment-${i}`}
                                                                className="w-full max-w-xs rounded-md object-contain"
                                                            />
                                                        );
                                                    }

                                                    if (type === "video") {
                                                        return (
                                                            <video
                                                                key={i}
                                                                controls
                                                                className="w-full max-w-xs rounded-md"
                                                            >
                                                                <source src={file.url} type="video/mp4" />
                                                                Your browser does not support the video tag.
                                                            </video>
                                                        );
                                                    }

                                                    if (type === "audio" || file.url.endsWith(".mp3") || file.url.endsWith(".wav")) {
                                                        return (
                                                            <audio
                                                                key={i}
                                                                controls
                                                                className="min-w-[80rem]"
                                                                style={{ minWidth: "50%", maxWidth: "100%" }}
                                                            >
                                                                <source src={file.url} />
                                                                Your browser does not support the audio element.
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

                                        {/* Content and timestamp */}
                                        <div className="flex justify-between items-end gap-2">
                                            <div className="flex-1 break-words">{currMessage.content}</div>
                                            <span className="text-[10px] text-gray-700 whitespace-nowrap">
                                                {new Date(currMessage.createdAt).toLocaleTimeString([], {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                    hour12: false
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                </div>


                            </div>




                        </div>
                    ))}
                <div ref={messagesEndRef} />
            </ScrollArea>
        </div>
    )
}

export default ScrollableChat