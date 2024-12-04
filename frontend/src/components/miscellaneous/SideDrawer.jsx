import React, { useState } from "react";
import { ChatState } from "@/Context/ChatProvider";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"



const SideDrawer = () => {
    const [search, setSearch] = useState("");
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isDrawerOpen, setDrawerOpen] = useState(false);

    const { user, setUser, setSelectedChat, chats, setChats, notification, setNotification } = ChatState();
    const navigate = useNavigate();
    const toast = useToast();

    const openDrawer = () => setDrawerOpen(true);
    const closeDrawer = () => setDrawerOpen(false);

    const logoutHandler = () => {
        setUser(null);
        localStorage.removeItem("userInfo");
        navigate('/')
    }

    const handleSearch = async () => {
        if (!search) {
            toast({ title: "Please Enter something in Search" });
            return;
        }
        try {
            setLoading(true);
            const response = await axios.get(`${process.env.REACT_APP_BACKEND_URI}/api/user?search=${search}`, {
                headers: { Authorization: `Bearer ${user.data.accessToken}`, "Content-Type": "application/json" },
                credentials: "include",
            });
            setSearchResult(response.data.data.users);
        } catch (error) {
            toast({ title: "Error occurred while searching user" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Top Bar */}
            <div className="flex justify-between items-center bg-white w-full px-4 py-3 border border-gray-200">

                {/* left tooltip for search user */}
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger onClick={openDrawer} className="cursor-pointer flex items-center space-x-2">
                            <i className="fa-solid fa-magnifying-glass text-lg"></i>
                            <span className="hidden md:inline-block">Search User</span>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Click to open the search bar</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                {/* middle heading */}
                <h2 fontSize={"2xl"} className="text-center"  >
                    ChatSphere
                </h2>

                {/* right notification and userinfo */}
                <div>
                    {/* for notifications  */}
                    {/* <DropdownMenu>
                        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuLabel>My Account</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                        </DropdownMenuContent>
                    </DropdownMenu> */}

                    {/* for userinfo */}
                    <DropdownMenu>
                        <DropdownMenuTrigger className="flex items-center space-x-2">
                            <Avatar className="w-8 h-8">
                                <AvatarImage src={user.data.user.profilePic} />
                                <AvatarFallback>User</AvatarFallback>
                            </Avatar>
                            <i className="fa-solid fa-angle-down text-gray-600"></i>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuLabel>My Profile</DropdownMenuLabel>
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
                            className="w-full p-2 bg-blue-500 text-white rounded"
                        >
                            Search
                        </button>
                        {loading ? (
                            <p className="text-center mt-4">Loading...</p>
                        ) : (
                            searchResult.map((user) => (
                                <div key={user._id} className="p-2 border-b cursor-pointer hover:bg-gray-100">
                                    {user.name}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default SideDrawer;
