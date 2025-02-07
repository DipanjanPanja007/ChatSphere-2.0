import React from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { ChatState } from "../../Context/ChatProvider"
import '../../App.css'
import { DropdownMenu } from '@radix-ui/react-dropdown-menu'
import { DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '../ui/dropdown-menu'


const ProfileModal = ({ user, children }) => {
    const { darkMode } = ChatState()


    return (
        <div>

            <Dialog>
                <DialogTrigger className=' w-full rounded-md'>
                    {
                        children ?
                            (<span >{children}</span>)
                            :
                            (<i class="fa-regular fa-eye"></i>)
                    }
                </DialogTrigger>
                <DialogContent
                    className={`${darkMode ? "dark-bg-black dark-font" : "light-bg-white light-font"}`}>
                    <DialogHeader>
                        <DialogTitle className="text-center text-4xl" >{user.name}</DialogTitle>
                        <DialogDescription>
                            <div className="relative w-60 h-60 rounded-full mx-auto my-7 group">
                                <DropdownMenu>
                                    <DropdownMenuTrigger className='relative'>
                                        <img
                                            src={user.profilePic}
                                            className="w-60 h-60 rounded-full object-cover transition duration-300 ease-in-out"
                                        />
                                        {/* Hazy Mist Overlay */}
                                        <div className="absolute inset-0 bg-black backdrop-blur-md opacity-0 group-hover:opacity-50 transition duration-300 ease-in-out rounded-full"></div>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                        className={`absolute top-1/2 left-1/2 z-50 ${darkMode ? "dark-bg-gray dark-font" : "light-bg-gray light-font"} rounded-lg shadow-lg`}>
                                        <DropdownMenuItem className='text-center'>View Photo</DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem>Change Photo</DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem>Remove Photo</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                            <h2 className={`text-center text-xl mb-2 ${darkMode ? "dark-font" : "light-font"}`}>{user.email}</h2>
                        </DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>


        </div>
    )
}

export default ProfileModal
