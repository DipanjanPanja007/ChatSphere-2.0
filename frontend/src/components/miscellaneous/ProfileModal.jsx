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
                    className={`${darkMode ? "dark-bg-black dark-font" : "light-bg-gray light-font"}`}>
                    <DialogHeader>
                        <DialogTitle className="text-center text-4xl" >{user.name}</DialogTitle>
                        <DialogDescription>
                            <img src={user.profilePic}
                                className='w-60 h-60 rounded-full mx-auto object-cover my-7'
                            />
                            <h2 className={`text-center text-xl mb-2 ${darkMode ? "dark-font" : "light-font"}`}>{user.email}</h2>
                        </DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>


        </div>
    )
}

export default ProfileModal
