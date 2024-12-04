import React, { useState } from 'react';
import { ChatState } from '../Context/ChatProvider';
import SideDrawer from '../components/miscellaneous/SideDrawer';
import MyChats from '../components/miscellaneous/MyChats';
import ChatBox from '../components/miscellaneous/ChatBox';
import { } from '../Context/ChatProvider'

const ChatPage = () => {
    const { user } = ChatState();
    const [fetchAgain, setFetchAgain] = useState(false);

    return (
        <div className="w-full">
            {/* Side Drawer */}
            {user && <SideDrawer />}

            <div className="flex justify-between w-full h-[91vh] p-4">
                {/* MyChats Component */}
                {user && (
                    <div className="flex-[3] border-r border-gray-200 pr-4">
                        <MyChats fetchAgain={fetchAgain} />
                    </div>
                )}

                {/* ChatBox Component */}
                {user && (
                    <div className="flex-[7] pl-4">
                        <ChatBox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatPage;
