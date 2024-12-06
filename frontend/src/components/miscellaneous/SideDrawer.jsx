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



const SideDrawer = () => {
    const [search, setSearch] = useState("");
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingChat, setLoadingChat] = useState(false);
    const [isDrawerOpen, setDrawerOpen] = useState(false);

    const { user, setUser, setSelectedChat, chats, setChats, notification, setNotification } = ChatState();
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
                headers: { Authorization: `Bearer ${user.data.accessToken}`, "Content-Type": "application/json" },
                credentials: "include",
            });
            // console.log(response.data.data.users);

            setSearchResult(response.data.data.users);
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
                    Authorization: `Bearer ${user.data.accessToken}`,
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
            <div className="flex justify-between items-center bg-white w-full px-4 py-3 border border-gray-200">

                {/* left tooltip for search user */}
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger onClick={openDrawer} className="cursor-pointer flex items-center space-x-2 bg-slate-200 px-4 py-2 rounded-md">
                            <i className="fa-solid fa-magnifying-glass text-lg"></i>
                            <span className="hidden md:inline-block">Search User</span>
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

                        <DropdownMenuContent className="px-3 py-1.5" >
                            {
                                !notification.length && "No New Messages"
                            }
                            {
                                notification.map((noti) => (
                                    <DropdownMenuLabel
                                        cursor={"pointer"}
                                        key={noti._id}
                                        className="px-3 py-1.5"
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

                    {/* for userinfo */}
                    <DropdownMenu>
                        <DropdownMenuTrigger className="flex items-center space-x-2 outline-none bg-slate-200 px-4 py-2 hover:bg-slate-300 rounded-md">
                            <Avatar className="w-8 h-8">
                                <AvatarImage src={user.data.user.profilePic} className="rounded-full mx-auto object-cover" />
                                <AvatarFallback>User</AvatarFallback>
                            </Avatar>
                            <i className="fa-solid fa-angle-down text-slate-800" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="px-3 py-1.5">
                            <ProfileModal user={user.data.user}>
                                <DropdownMenuLabel>My Profile</DropdownMenuLabel>
                            </ProfileModal>

                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={logoutHandler}>Logout<i class="fa-solid fa-right-from-bracket" /></DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>


                </div>
            </div>



            {/* Full-Screen Left Drawer */}
            <div
                className={`fixed top-0 left-0 h-full w-full bg-black bg-opacity-40 z-50 transition-opacity duration-300 ${isDrawerOpen ? "opacity-100 visible" : "opacity-0 invisible"
                    }`}
                onClick={closeDrawer}
            >
                <div
                    className={`fixed top-0 left-0 h-full w-80 bg-white shadow-lg z-50 transform transition-transform duration-300 ${isDrawerOpen ? "translate-x-0" : "-translate-x-full"
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
                            className="w-full p-2 border border-gray-300 rounded mb-4"
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
