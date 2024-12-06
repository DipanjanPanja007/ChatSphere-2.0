import React, { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
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
import Loading from './Loading';
import UserListItem from './UserListItem';


const UpdateGroupChatModal = ({ fetchAgain, setFetchAgain, fetchMessages }) => {

    const [groupChatName, setGroupChatName] = useState();
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false);
    const [renameLoading, setRenameLoading] = useState(false);
    const { toast } = useToast();


    const { selectedChat, setSelectedChat, user } = ChatState();



    const handleAddUser = async (userToAdd) => {
        if (selectedChat.users.find((u) => u._id === userToAdd._id)) {
            toast({
                title: "Error occoured",
                description: "User already exists",
                variant: "error",
            });
            return;
        }

        if (selectedChat.groupAdmin._id !== user.data.user._id) {
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
                    Authorization: `Bearer ${user.data.accessToken}`
                }
            }

            const { data } = await axios.put(`${import.meta.env.VITE_BACKEND_URI}/api/chat/groupadd`, {
                chatId: selectedChat._id,
                userId: userToAdd._id,
            },
                config,
            )

            setSelectedChat(data.data)
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

        if (selectedChat.groupAdmin._id !== user.data.user._id && userToRemove._id !== user.data.user._id) {
            toast({
                title: "Error occoured",
                description: "Only Admin can remove members",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom-middle"
            })
            return;
        }

        try {
            setLoading(true)
            const config = {
                headers: {
                    Authorization: `Bearer ${user.data.accessToken}`
                }
            }

            const { data } = await axios.put(`${import.meta.env.VITE_BACKEND_URI}/api/chat/groupremove`, {
                chatId: selectedChat._id,
                userId: userToRemove._id,
            },
                config,
            )

            userToRemove._id === user.data.user._id ? setSelectedChat() : setSelectedChat(data.data)
            toast({
                title: `User ${userToRemove.name} removed successfully`,
                variant: "success",
            })
            setFetchAgain(!fetchAgain)
            fetchMessages();
            setLoading(false)
        } catch (error) {
            toast({
                title: "Error occoured",
                description: "Someting went wrong while adding user into group",
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
                    Authorization: `Bearer ${user.data.accessToken}`
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
                title: "Error occoured",
                description: "Failed to update groupChat name",
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
                    Authorization: `Bearer ${user.data.accessToken}`,
                    'Content-Type': 'application/json',
                },
                credentials: "include",
            });

            // console.log("user array :response from searched user: ", data.data.users);
            setSearchResult(data.data.users);
            console.log(data.data.users)
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
                <DialogTrigger className='hover:bg-slate-200 px-2 py-1 rounded-md'><i class="fa-regular fa-eye "></i></DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle
                            className='text-center font-bold text-3xl'
                        >{selectedChat.chatName.toUpperCase()}
                        </DialogTitle>
                        <DialogDescription>
                            {
                                selectedChat.isGroupChat ? (<h3 className='text-xl'>Group admin is: {selectedChat.groupAdmin.name}</h3>) : (<></>)
                            }

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
                                    className='mb-3'
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
                                    className='mb-3'
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
                                    <Loading />
                                )
                            }
                        </DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default UpdateGroupChatModal
