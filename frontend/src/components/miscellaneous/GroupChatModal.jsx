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
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { useToast } from '@/hooks/use-toast'
import UserBadgeItem from './UserBadgeItem'
import axios from 'axios'
import { ChatState } from '@/Context/ChatProvider'
import UserListItem from './UserListItem'
import SkeletonUI from './Skeleton'



const GroupCharModal = ({ children }) => {


    const { user, chats, setChats, setSelectedChat, darkMode } = ChatState()
    const [search, setSearch] = useState("")
    const [groupChatName, setGroupChatName] = useState();
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [groupIcon, setGroupIcon] = useState(null);
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();


    const handelSearch = async (query) => {
        if (!query) {
            setSearchResult([])
            setSearch("")
            return;
        }
        setSearch(query)

        try {
            setLoading(true)

            const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URI}/api/user?search=${query}`, {
                headers: {
                    Authorization: `Bearer ${user.accessToken}`,
                    'Content-Type': 'application/json',
                },
                credentials: "include",
            });

            // console.log("user array :response from searched user: ", data.users);
            setSearchResult(data.users);


        } catch (error) {
            console.log(error);
            toast({
                description: "Failed to search users while creating group chat",
                variant: "error",
            })
        } finally {
            setLoading(false)
        }


    };


    const handleDelete = (deleteUser) => {
        setSelectedUsers(selectedUsers.filter((user) => user._id !== deleteUser._id));
    };

    const handleGroup = (userToAdd) => {
        if (selectedUsers.some((user) => user._id === userToAdd._id)) {
            toast({
                title: "User already added",
                variant: "error",
            })
            return;
        }
        setSelectedUsers([...selectedUsers, userToAdd]);
    };

    const handelSubmit = async () => {
        if (!groupChatName) {
            toast({
                title: "A group name is necessary !! ",
                variant: "error",
            })
            return;
        }
        if (selectedUsers.length < 2) {
            toast({
                title: `Add at least ${2 - selectedUsers.length} more to create a group bro!!! `,
                variant: "error",
            })
            return;
        }
        try {
            const formData = new FormData();
            formData.append("groupName", groupChatName);
            formData.append("users", selectedUsers.map(user => user._id).join(","));
            formData.append("groupIcon", groupIcon);
            const { data } = await axios.post(`${import.meta.env.VITE_BACKEND_URI}/api/chat/group`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${user.accessToken}`,
                        "Content-Type": "multipart/form-data",               // Required for FormData
                    }
                }
            );
            console.log("data", data);

            if (!data) {
                console.log("group chat is not created");
            }

            setChats([data.createdGroupChat, ...chats]);

            toast({
                title: `Group chat: ${groupChatName} is created`,
                variant: "success",
            })

            // Clear the input fields and selected users
            handleClose();

            // // new created groupchat is selected if reqd........
            // setSelectedChat(data.data.data)

        } catch (error) {
            console.log("Error while creating group chat", error);
            toast({
                title: "Error occoured while creating group chat",
                variant: "error",
            })

        }
    };

    const handleClose = () => {
        setSearch("")
        setSearchResult([]);
        setSelectedUsers([]);
        setGroupChatName("");
        setGroupIcon(null);
    };



    return (
        <div>
            <Dialog className="h-auto" onOpenChange={(isOpen) => !isOpen && handleClose()} >
                <DialogTrigger>{children}</DialogTrigger>
                <DialogContent className={`${darkMode ? "dark-bg-black dark-font" : "light-bg-gray light-font"}`}>
                    <DialogHeader>
                        <DialogTitle className="text-center mb-4" >Create Group Chat</DialogTitle>
                        <DialogDescription className="text-black text-md">
                            {/* input for group chat name */}
                            <Input
                                placeholder="Chat name"
                                className={`p-2 my-4 ${darkMode ? "dark-bg-gray dark-font" : "light-bg-white light-font"}`}
                                value={groupChatName}
                                onChange={(e) => setGroupChatName(e.target.value)}
                            />

                            {/* input for group icon */}
                            <Input
                                type="file"
                                id="groupIcon"
                                name="groupIcon"
                                accept="image/*"
                                className={`p-2 my-4  ${darkMode ? "dark-bg-gray dark-font" : "light-bg-white light-font"}`}
                                onChange={(e) => {
                                    setGroupIcon(e.target.files[0]);
                                }
                                }
                            />

                            {/* input for adding users */}
                            <Input
                                placeholder="Add Users..."
                                className={`p-2 my-4 ${darkMode ? "dark-bg-gray dark-font" : "light-bg-white light-font"}`}
                                value={search}
                                onChange={(e) => handelSearch(e.target.value)} />

                            <div className='flex flex-wrap justify-between my-4' >
                                {
                                    selectedUsers.map((user) => (
                                        <UserBadgeItem key={user._id} user={user} handleFunction={() => handleDelete(user)} />
                                    ))
                                }
                            </div>
                            {
                                loading ? <div><SkeletonUI /></div> : (
                                    searchResult?.slice(0, 4).map((user) => (
                                        <UserListItem
                                            key={user._id}
                                            user={user}
                                            handleFunction={() => handleGroup(user)}
                                        />
                                    ))
                                )
                            }
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button className='m-3 bg-cyan-600 hover:bg-cyan-900' onClick={handelSubmit} >
                            Create Group
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>




        </div>
    )
}

export default GroupCharModal
