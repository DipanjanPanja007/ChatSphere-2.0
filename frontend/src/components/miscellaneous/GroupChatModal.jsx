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
import Loading from './Loading'



const GroupCharModal = ({ children }) => {


    const { user, chats, setChats, setSelectedChat } = ChatState()
    const [search, setSearch] = useState("")
    const [groupChatName, setGroupChatName] = useState();
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();


    const handelSearch = async (query) => {
        if (!query) {
            return;
        }
        setSearch(query)

        try {
            setLoading(true)

            const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URI}/api/user?search=${query}`, {
                headers: {
                    Authorization: `Bearer ${user.data.accessToken}`,
                    'Content-Type': 'application/json',
                },
                credentials: "include",
            });

            console.log("user array :response from searched user: ", data.data.users);
            setSearchResult(data.data.users);


        } catch (error) {
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
                title: "Error occoured",
                variant: "error",
            })
            return;
        }
        setSelectedUsers([...selectedUsers, userToAdd]);
    };

    const handelSubmit = async () => {
        if (!groupChatName || !selectedUsers) {
            toast({
                title: "Error occoured",
                description: "Fill all the fields",
                variant: "error",
            })
            return;
        }
        if (selectedUsers.length < 2) {
            toast({
                title: "Error occoured",
                description: "Group Chat needs atleast 3 people bro !!! ",
                variant: "error",
            })
            return;
        }
        try {
            const data = await axios.post(`${import.meta.env.VITE_BACKEND_URI}/api/chat/group`,
                {
                    groupName: groupChatName,
                    users: JSON.stringify(selectedUsers.map(user => user._id))
                },
                {
                    headers: {
                        Authorization: `Bearer ${user.data.accessToken}`,
                        'Content-Type': 'application/json',
                    }
                }
            );

            if (!data) {
                console.log("group chat is not created");
            }

            setChats([data.data.data, ...chats]);

            toast({
                title: `Group chat: ${groupChatName} is created`,
                variant: "success",
            })

            // Clear the input fields and selected users
            setSearch("")
            setGroupChatName("");
            setSearchResult([]);
            setSelectedUsers([]);

            // // new created groupchat is selected if reqd........
            // setSelectedChat(data.data.data)

        } catch (error) {
            toast({
                title: "Error occoured while creating group chat",
                variant: "error",
            })

        }
    };

    const handleClose = () => {
        setSearchResult([]);
        setSearch("")
    };



    return (
        <div>
            <Dialog className="h-auto" onOpenChange={(isOpen) => !isOpen && handleClose()} >
                <DialogTrigger>{children}</DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-center mb-4" >Create Group Chat</DialogTitle>
                        <DialogDescription className="text-black text-md">
                            <Input
                                placeholder="Chat name"
                                className="p-2 my-4"
                                value={groupChatName}
                                onChange={(e) => setGroupChatName(e.target.value)} />

                            <Input
                                placeholder="Add Users..."
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
                                loading ? <div><Loading /></div> : (
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
