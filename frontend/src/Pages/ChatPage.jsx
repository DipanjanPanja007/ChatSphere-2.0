import React, { useState } from 'react';
import { ChatState } from '../Context/ChatProvider';
import SideDrawer from '../components/miscellaneous/SideDrawer';
import MyChats from '../components/miscellaneous/MyChats';
import ChatBox from '../components/miscellaneous/ChatBox';
import { } from '../Context/ChatProvider'

const ChatPage = () => {
    const { user } = ChatState();
    const [fetchAgain, setFetchAgain] = useState(false);      // true if fetching chats is needed

    return (
        <div className="w-full">
            {/* Side Drawer */}
            {user && <SideDrawer />}

            <div className="flex justify-between w-full h-[91vh] p-4">
                {/* MyChats Component */}
                {user && (<MyChats fetchAgain={fetchAgain} />)}

                {/* ChatBox Component */}
                {user && (<ChatBox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />)}
            </div>
        </div>
    );
};

export default ChatPage;
