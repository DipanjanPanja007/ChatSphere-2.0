import React from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"


const ProfileModal = ({ user, children }) => {


    return (
        <div>

            <Dialog>
                <DialogTrigger className='px-2 py-1 rounded-md hover:bg-slate-200'>
                    {
                        children ?
                            (<span >{children}</span>)
                            :
                            (<i class="fa-regular fa-eye"></i>)
                    }
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-center text-4xl" >{user.name}</DialogTitle>
                        <DialogDescription>
                            <img src={user.profilePic}
                                className='w-60 h-60 rounded-full mx-auto object-cover my-7'
                            />
                            <h2 className='text-center text-black text-xl mb-2'>{user.email}</h2>
                        </DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>


        </div>
    )
}

export default ProfileModal
