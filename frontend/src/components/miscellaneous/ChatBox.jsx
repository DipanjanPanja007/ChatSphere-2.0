import React from 'react'
import { ChatState } from '../../Context/ChatProvider'
import SingleChat from './SingleChat.jsx'

const ChatBox = ({ fetchAgain, setFetchAgain }) => {
    const { selectedChat } = ChatState()
    return (
        <div
            className={`${selectedChat ? "flex" : "hidden"} md:flex flex-col items-center p-3 bg-white w-full md:w-[68%] rounded-lg border border-gray-300 overflow-y-auto h-full`} >
            <SingleChat fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
        </div>
    )
}

export default ChatBox
