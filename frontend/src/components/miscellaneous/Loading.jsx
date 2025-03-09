import { ChatState } from "@/Context/ChatProvider";
import React from "react";

const Loading = ({ width = "w-full" }) => {
    const { darkMode } = ChatState()
    return (
        <div className={`flex justify-center items-center ${width} h-20`}>
            <div className={`animate-spin rounded-full h-10 w-10 border-t-4 border-white border-solid`}></div>
        </div>
    );
};

export default Loading;
