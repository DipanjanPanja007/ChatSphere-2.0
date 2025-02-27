import React, { useState } from "react";
import { ChatState } from "@/Context/ChatProvider";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import ProfileModal from "./ProfileModal";
import Loading from "./Loading";
import { useToast } from "@/hooks/use-toast";
import UserListItem from "./UserListItem";
import { getSender } from "@/config/ChatLogic";
import { Button } from "../ui/button";



const SideDrawer = () => {
    const [search, setSearch] = useState("");
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingChat, setLoadingChat] = useState(false);
    const [isDrawerOpen, setDrawerOpen] = useState(false);

    const { user, setUser, setSelectedChat, chats, setChats, notification, setNotification, darkMode, setDarkMode } = ChatState();
    const navigate = useNavigate();
    const { toast } = useToast();

    const openDrawer = () => {
        setDrawerOpen(true)
        setSearch("")
        setSearchResult([])
    };
    const closeDrawer = () => setDrawerOpen(false);

    const logoutHandler = () => {
        setUser(null);
        localStorage.removeItem("userInfo");
        navigate('/')
    }

    const handleSearch = async () => {
        if (!search) {
            toast({
                title: "Please Enter something in Search"
            });
            return;
        }
        try {
            setLoading(true);
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URI}/api/user?search=${search}`, {
                headers: { Authorization: `Bearer ${user.accessToken}`, "Content-Type": "application/json" },
                credentials: "include",
            });
            // console.log(response.data.data.users);

            setSearchResult(response.data.users);
        } catch (error) {
            toast({
                title: "Error occurred while searching user",
                variant: "error"
            });
        } finally {
            setLoading(false);
        }
    };


    const accessChat = async (userId) => {
        try {
            setLoadingChat(true);
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




            if (!chats.find((c) => c._id === response.data._id)) setChats([response.data, ...chats])

            setSelectedChat(response.data)


        } catch (error) {
            toast({
                title: "Error occoured while fetching chats",
                variant: "error"
            });
        } finally {
            setLoadingChat(false);
        }
    };

    return (
        <>
            {/* Top Bar */}
            <div className={`flex justify-between items-center ${darkMode ? "dark-bg-black dark-font border-gray-600" : "light-bg-white border-gray-200"} w-full px-4 py-3 border  h-[9vh]`}>

                {/* left tooltip for search user */}
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger
                            onClick={openDrawer}
                            className={`cursor-pointer flex items-center space-x-2 ${darkMode ? "dark-bg-gray" : "light-bg-gray"} px-4 py-2 rounded-md`} >
                            <i className="fa-solid fa-magnifying-glass text-lg"></i>
                            <span className="hidden md:inline-block">
                                Search User
                            </span>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Click to open the search bar</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                {/* middle heading */}
                <h2 className="text-center text-3xl"  >
                    ChatSphere
                </h2>

                {/* right notification and userinfo */}
                <div className="flex flex-row">
                    {/* for notifications  */}
                    <DropdownMenu  >
                        <DropdownMenuTrigger className="p-3 outline-none">
                            <i className="fa-solid fa-bell text-xl"></i>
                            {
                                notification.length ?
                                    (<span>&#40;{notification.length}&#41;</span>)
                                    : (<></>)
                            }
                        </DropdownMenuTrigger>

                        <DropdownMenuContent className={`px-3 py-1.5 ${darkMode ? "dark-bg-black dark-font" : "light-bg-white light-font"}`} >
                            {
                                !notification.length && "No New Messages"
                            }
                            {
                                notification.map((noti) => (
                                    <DropdownMenuLabel
                                        key={noti._id}
                                        className={`px-3 py-1.5 cursor-pointer ${darkMode ? "dark-bg-black dark-font" : "light-bg-white light-font"}`}
                                        onClick={() => {
                                            setSelectedChat(noti.chat);
                                            setNotification(notification.filter((n) => n !== noti));
                                        }}
                                    >
                                        {
                                            noti.chat.isGroupChat ?
                                                `New Message from ${noti.chat.chatName}` :
                                                `New Message from ${getSender(user, noti.chat.users)}`
                                        }
                                    </DropdownMenuLabel>

                                ))
                            }
                            {/* <DropdownMenuSeparator /> */}
                        </DropdownMenuContent>
                    </DropdownMenu>


                    {/* Dark-Light Mode Toggle switch */}
                    <div
                        className="flex items-center mr-4"
                    >
                        <button
                            className={`flex`}
                            onClick={(e) => {
                                e.preventDefault();
                                setDarkMode(!darkMode);
                            }}
                        >
                            <img src={darkMode ? "src/public/lightMode_img.png" : "src/public/darkMode_img.png"} className="w-8 h-8 rounded-full" alt="Dark Mode" />
                        </button>
                    </div>

                    {/* for userinfo */}
                    <DropdownMenu>
                        <DropdownMenuTrigger
                            className={`flex items-center space-x-2 outline-none ${darkMode ? "dark-bg-gray dark-font hover:bg-slate-500" : "light-bg-gray light-font hover:bg-slate-300"} px-4 py-2 rounded-md`} >
                            <Avatar className="w-8 h-8">
                                <AvatarImage src={user.profilePic} className="rounded-full mx-auto object-cover" />
                                <AvatarFallback>User</AvatarFallback>
                            </Avatar>
                            <i className={`fa-solid fa-angle-down ${darkMode ? "dark-font" : "light-font"}`} />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className={`justify-center ${darkMode ? "dark-bg-gray dark-font" : "light-bg-gray light-font"} `} >
                            <ProfileModal user={user}
                                className='flex justify-center items-center p-0'>
                                <DropdownMenuLabel
                                    className={`px-6 py-3 rounded-sm cursor-pointer text-center ${darkMode ? "hover:bg-slate-300 hover:text-black" : "hover:bg-slate-300"} `}
                                >My Profile
                                </DropdownMenuLabel>
                            </ProfileModal>

                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className={`px-6 py-3 cursor-pointer flex justify-center items-center font-medium ${darkMode ? "hover:bg-slate-500" : "hover:bg-slate-300"}`}
                                onClick={logoutHandler}>Logout
                                <i class="fa-solid fa-right-from-bracket" />
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>


                </div>
            </div>



            {/* Full-Screen Left Drawer */}
            <div
                className={`fixed top-0 left-0 h-full w-full bg-opacity-40 z-50 transition-opacity duration-300 ${isDrawerOpen ? "opacity-100 visible" : "opacity-0 invisible"
                    }`}
                onClick={closeDrawer}
            >
                <div
                    className={`fixed top-0 left-0 h-full w-80 ${darkMode ? "dark-bg-black dark-font" : "light-bg-gray light-font"} shadow-lg z-50 transform transition-transform duration-300 ${isDrawerOpen ? "translate-x-0" : "-translate-x-full"
                        }`}
                    onClick={(e) => e.stopPropagation()} // Prevent close on clicking inside drawer
                >
                    <div className="flex justify-between items-center border-b p-4">
                        <h2 className="text-xl font-semibold">Search User</h2>
                        <button onClick={closeDrawer} className="text-2xl font-bold">&times;</button>
                    </div>

                    <div className="p-4">
                        <input
                            type="text"
                            placeholder="Search by name or email"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className={`${darkMode ? "dark-bg-gray dark-font" : "light-bg-white light-font"} w-full p-2 border border-gray-300 rounded mb-4`}
                        />
                        <button
                            onClick={handleSearch}
                            className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600 mb-4"
                        >
                            Search
                        </button>
                        {loading ?
                            (<Loading />) : (
                                searchResult.map((user) => (
                                    <UserListItem
                                        key={user._id}
                                        user={user}
                                        handleFunction={() => accessChat(user._id)}
                                    />
                                ))
                            )
                        }
                    </div>
                </div>
            </div>
        </>
    );
};

export default SideDrawer;
