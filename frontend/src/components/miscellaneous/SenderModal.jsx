import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import '../../App.css';
import { ChatState } from "@/Context/ChatProvider";

const SenderModal = ({ user }) => {
    const { darkMode } = ChatState();
    const [isOpen, setIsOpen] = useState(false); // For zoomed-in image

    return (
        <div>
            <Dialog>
                <DialogTrigger className='w-full rounded-md'>
                    <i className="fa-regular fa-eye"></i>
                </DialogTrigger>

                <DialogContent className={`${darkMode ? "dark-bg-black dark-font" : "light-bg-white light-font"}`}>
                    <DialogHeader>
                        <DialogTitle className="text-center text-4xl">{user.name}</DialogTitle>
                        <DialogDescription>
                            <div className="relative w-60 h-60 rounded-full mx-auto my-7 group">
                                <img
                                    src={user.profilePic}
                                    className="w-60 h-60 rounded-full object-cover transition duration-300 ease-in-out cursor-pointer"
                                    onClick={() => setIsOpen(true)}
                                />
                            </div>

                            {/* Zoomed Image Modal */}
                            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                                <DialogContent className={`flex justify-center items-center ${darkMode ? "dark-bg-black" : "light-bg-white"} p-4 w-auto h-auto`}>
                                    <DialogDescription className="flex justify-center">
                                        <img
                                            src={user.profilePic}
                                            className="max-w-full max-h-screen rounded-lg object-contain"
                                        />
                                    </DialogDescription>
                                </DialogContent>
                            </Dialog>

                            <h2 className={`text-center text-xl mb-2 ${darkMode ? "dark-font" : "light-font"}`}>{user.email}</h2>
                        </DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default SenderModal;
