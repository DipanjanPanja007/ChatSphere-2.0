import React, { useEffect, useRef } from 'react'
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { isSameUser, setSenderMargin } from '@/config/ChatLogic'
import { ChatState } from '@/Context/ChatProvider'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, } from "@/components/ui/tooltip"

const ScrollableChat = ({ messages }) => {
    const { user } = ChatState()
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'instant' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    return (
        <div className="flex flex-col scroll-smooth h-full w-full">
            <ScrollArea className="px-4 w-full overflow-y-auto">
                {messages &&
                    messages.map((currMessage, index) => (
                        <div
                            className={`flex w-full ${currMessage.sender._id === user.data.user._id ? "justify-end" : "justify-start"}`}
                            key={currMessage._id}
                        >
                            {/* Avatar logic */}
                            {currMessage.sender._id !== user.data.user._id &&
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
                            <span
                                className={`rounded-[1.5rem] px-4 py-2 max-w-[75%] bg-gray-200 
                                ${currMessage.sender._id === user.data.user._id ? "bg-[#BFA7FA]" : "bg-[#F0B99E]"}`}
                                style={{
                                    wordBreak: "break-word", // Ensures text breaks within words
                                    overflowWrap: "break-word", // Wraps long words properly
                                    marginLeft:
                                        currMessage.sender._id !== user.data.user._id
                                            ? setSenderMargin(messages, currMessage, index, user.data.user._id)
                                            : undefined,
                                    marginTop: isSameUser(messages, currMessage, index) ? "3px" : "10px",
                                }}
                            >
                                {currMessage.content}
                            </span>
                        </div>
                    ))}
                <div ref={messagesEndRef} />
            </ScrollArea>
        </div>
    )
}

export default ScrollableChat