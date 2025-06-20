import React, { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import { ChatState } from '@/Context/ChatProvider';
import UserBadgeItem from './UserBadgeItem';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import UserListItem from './UserListItem';
import SkeletonUI from './Skeleton';


const UpdateGroupChatModal = ({ fetchAgain, setFetchAgain, fetchMessages }) => {

    const [groupChatName, setGroupChatName] = useState();
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false);
    const [renameLoading, setRenameLoading] = useState(false);
    const { toast } = useToast();


    const { selectedChat, setSelectedChat, user, darkMode } = ChatState();



    const handleAddUser = async (userToAdd) => {
        console.log("selectedChat: ", selectedChat);
        if (selectedChat.users.find((u) => u._id === userToAdd._id)) {
            toast({
                title: "Error occoured",
                description: "User already exists",
                variant: "error",
            });
            return;
        }

        if (selectedChat.groupAdmin._id !== user._id) {
            toast({
                title: "Error occoured",
                description: "Only Admin can add members",
                variant: "error",
            })
            return;
        }

        try {
            setLoading(true)
            const config = {
                headers: {
                    Authorization: `Bearer ${user.accessToken}`
                }
            }

            const { data } = await axios.put(`${import.meta.env.VITE_BACKEND_URI}/api/chat/groupadd`, {
                chatId: selectedChat._id,
                userId: userToAdd._id,
            },
                config,
            )

            setSelectedChat(data)
            setFetchAgain(!fetchAgain)
            setLoading(false)
        } catch (error) {
            toast({
                title: "Error occoured",
                description: "Someting went wrong while adding user into group",
                variant: "error",
            })
        }

    };

    const handleRemoveUser = async (userToRemove) => {

        if (selectedChat.groupAdmin._id !== user._id && userToRemove._id !== user._id) {
            toast({
                title: "Only Admin can remove members",
                variant: "error",
            })
            return;
        }

        try {
            setLoading(true)
            const config = {
                headers: {
                    Authorization: `Bearer ${user.accessToken}`
                }
            }

            const { data } = await axios.put(`${import.meta.env.VITE_BACKEND_URI}/api/chat/groupremove`, {
                chatId: selectedChat._id,
                userId: userToRemove._id,
            },
                config,
            )

            userToRemove._id === user._id ? setSelectedChat() : setSelectedChat(data)
            if (userToRemove._id === user._id) {
                toast({
                    title: `You left the group`,
                    variant: "success",
                })
            }
            else {
                toast({
                    title: `User ${userToRemove.name} removed successfully`,
                    variant: "success",
                })
            }
            setFetchAgain(!fetchAgain)
            fetchMessages();
            setLoading(false)
        } catch (error) {
            toast({
                title: "Someting went wrong while adding user into group",
                variant: "error",
            })
        }
    };

    const handelRename = async () => {
        /*
         * check for valid input
         * if input valid, update in db 
         */
        if (!groupChatName) return;

        try {
            setRenameLoading(true);

            const config = {
                headers: {
                    Authorization: `Bearer ${user.accessToken}`
                }
            }

            const { data } = await axios.put(`${import.meta.env.VITE_BACKEND_URI}/api/chat/rename`, {
                chatId: selectedChat._id,
                newChatName: groupChatName,
            },
                config,
            )

            setSelectedChat(data.data);
            setFetchAgain(!fetchAgain);

            toast({
                title: "GroupChat name updated successfully",
                variant: "success",
            })
        } catch (error) {
            toast({
                title: "Failed to update groupChat name",
                variant: "error",
            })
        } finally {
            setRenameLoading(false);
        }
        setGroupChatName("");

    };


    const handleSearch = async (query) => {
        if (!query) {
            toast({
                title: "Please Enter something in Search",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "top-middle"
            });
            return;
        }
        try {
            setLoading(true)

            const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URI}/api/user?search=${query}`, {
                headers: {
                    Authorization: `Bearer ${user.accessToken}`,
                    'Content-Type': 'application/json',
                },
                credentials: "include",
            });

            // console.log("user array :response from searched user: ", data);
            setSearchResult(data.users);
            setLoading(false)

        } catch (error) {
            toast({
                title: "Error occoured while Searching User",
                variant: "warning",
            });
        }
    };

    return (
        <div>
            <Dialog>
                <DialogTrigger className=' rounded-md'><i class="fa-regular fa-eye "></i></DialogTrigger>
                <DialogContent className={`${darkMode ? "dark-bg-black dark-font" : "light-bg-gray light-font"}`}>
                    <DialogHeader>
                        <DialogTitle className='text-center font-bold text-3xl relative' >
                            <div className="relative w-48 h-48 rounded-full mx-auto group bg-red-500">
                                {/* group chat icon */}
                                <img
                                    src={selectedChat.groupIcon}
                                    className="w-50 h-50 rounded-full object-cover transition duration-300 ease-in-out"
                                />
                                {/* Hazy Mist Overlay */}
                                <div className="absolute inset-0 bg-black backdrop-blur-md opacity-0 group-hover:opacity-50 transition duration-300 ease-in-out rounded-full"></div>
                            </div>

                        </DialogTitle>
                        <DialogDescription>
                            <div
                                className={`text-center font-bold text-3xl ${darkMode ? "dark-font" : "light-font"}`}
                            >{selectedChat.chatName}
                            </div>
                            {
                                selectedChat.isGroupChat ?
                                    (<h3 className={`text=xl ${darkMode ? "dark-font" : "light-font"} `}>Group admin is: {selectedChat.groupAdmin.name}</h3>) : (<></>)
                            }
                            <div>
                                {/* <img
                                            src={selectedChat.}
                                            className="w-60 h-60 rounded-full object-cover transition duration-300 ease-in-out"
                                        /> */}
                            </div>

                            <div className='flex wrap w-full pb-2 my-4 justify-between'>
                                {
                                    selectedChat.users.map((u) => (
                                        <UserBadgeItem key={u._id} user={u} handleFunction={() => handleRemoveUser(u)} />
                                    ))
                                }
                            </div>

                            <form className='flex mb-1'>
                                <Input
                                    placeholder='Chat Name'
                                    className={`mb-3 ${darkMode ? "dark-bg-gray dark-font" : "light-bg-white light-font"}`}
                                    value={groupChatName}
                                    onChange={(e) => (setGroupChatName(e.target.value))}
                                />

                                <Button
                                    className='bg-teal-500 text-white ml-3'
                                    onClick={handelRename}
                                >Update</Button>
                            </form>

                            <form className=''>
                                <Input
                                    placeholder='Add User into Group'
                                    className={`mb-3 ${darkMode ? "dark-bg-gray dark-font" : "light-bg-white light-font"}`}
                                    onChange={(e) => handleSearch(e.target.value)}
                                />
                            </form>
                            {
                                !loading ? (
                                    searchResult.slice(0, 4).map((u) => (
                                        <UserListItem
                                            key={u._id}
                                            user={u}
                                            handleFunction={() => handleAddUser(u)}
                                        />
                                    ))
                                ) : (
                                    <SkeletonUI />
                                )
                            }
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            className='bg-red-500 text-white hover:bg-red-600'
                            onClick={() => handleRemoveUser(user)}>
                            Leave Group
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default UpdateGroupChatModal
