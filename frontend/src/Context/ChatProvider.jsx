import { createContext, useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';

const ChatContext = createContext()


const ChatProvider = ({ children }) => {

    const [user, setUser] = useState();
    const [selectedChat, setSelectedChat] = useState();
    const [chats, setChats] = useState([]);
    const [notification, setNotification] = useState([]);
    const [darkMode, setDarkMode] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        try {
            const userInfo = JSON.parse(localStorage.getItem("userInfo"));
            if (!userInfo) {
                navigate("/");
            } else {
                setUser(userInfo);
            }
        } catch (error) {
            console.error("Error parsing userInfo:", error);
            navigate("/");
        }
    }, []);

    return <ChatContext.Provider
        value={{ user, setUser, selectedChat, setSelectedChat, chats, setChats, notification, setNotification, darkMode, setDarkMode }}
    >{children}
    </ChatContext.Provider>
};

export const ChatState = () => {
    return useContext(ChatContext)
}


export default ChatProvider;