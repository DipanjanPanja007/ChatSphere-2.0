import React, { useEffect, useRef, useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import '../../App.css'
import { DropdownMenu } from '@radix-ui/react-dropdown-menu'
import { DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '../ui/dropdown-menu'
import { useToast } from "@/hooks/use-toast"
import axios from 'axios'
import { ChatState } from "@/Context/ChatProvider";



const ProfileModal = ({ children }) => {

    const { toast } = useToast();
    const { darkMode } = ChatState();
    const [isOpen, setIsOpen] = useState(false); // Control modal state
    const [tempProfilePic, setTempProfilePic] = useState(null);
    const { user, setUser } = ChatState();
    const fileInputRef = useRef(null);

    const changeProfilePic = async () => {
        const profilePicFile = tempProfilePic || null;
        if (!profilePicFile) {
            return toast({
                title: 'No file selected',
                variant: 'error',
            })
        }
        const formData = new FormData();
        formData.append('profilePicture', profilePicFile);

        try {
            const response = await axios.put(
                `${import.meta.env.VITE_BACKEND_URI}/api/user/updateDp`,
                formData,
                {
                    withCredentials: true,
                    headers: {
                        "Content-Type": "multipart/form-data", // Required for FormData
                    },
                }
            );
            // console.log("response: ", response);
            if (response.status !== 200) {
                throw new Error(response.data?.message || "failed to change profile picture");
            }

            let userInfo = localStorage.getItem('userInfo');
            userInfo = JSON.parse(userInfo);
            // console.log("userInfo: ", userInfo);
            userInfo.profilePic = response.data.profilePic;
            localStorage.setItem('userInfo', JSON.stringify(userInfo));
            setUser(userInfo);


            // success message
            toast({
                title: 'Profile picture changed successfully',
                variant: 'success',
            })

            // Clear file input
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        } catch (error) {
            console.log("Error occoured while changing profile picture: ", error);
        }


    };

    useEffect(() => {
        if (tempProfilePic) {
            // console.log("pf: ", tempProfilePic);
            changeProfilePic();
        }
    }, [tempProfilePic])

    const deleteProfilePic = async () => {

        // console.log(user);
        if (user.profilePic === "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg") {
            return toast({
                variant: 'error',
                title: 'No profile picture to delete',
            })
        }

        const response = await axios.delete(`${import.meta.env.VITE_BACKEND_URI}/api/user/deleteDp`, {
            withCredentials: true,
        });
        if (response.status !== 200) {
            throw new Error(response.data?.message || "failed to delete profile picture");
        }
        // console.log(response.data);

        let userInfo = localStorage.getItem('userInfo');
        userInfo = JSON.parse(userInfo);
        // console.log("before userInfo: ", userInfo);
        userInfo.profilePic = response.data.profilePic;
        // console.log("after userInfo: ", userInfo);
        setUser(userInfo);
        localStorage.setItem('userInfo', JSON.stringify(userInfo));

        toast({
            variant: 'success',
            title: 'Profile picture removed successfully',
        })


    }

    return (
        <div>
            <Dialog>
                <DialogTrigger className='w-full rounded-md'>
                    {children ? <span>{children}</span> : <i class="fa-regular fa-eye"></i>}
                </DialogTrigger>
                <DialogContent className={`${darkMode ? "dark-bg-black dark-font" : "light-bg-white light-font"}`}>
                    <DialogHeader>
                        <DialogTitle className="text-center text-4xl">{user.name}</DialogTitle>
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
                                    <DropdownMenuContent className={`absolute top-1/2 left-1/2 z-50 ${darkMode ? "dark-bg-gray dark-font" : "light-bg-gray light-font"} rounded-lg shadow-lg`}>
                                        {/* Open inner Dialog using useState to prevent auto-closing */}
                                        <DropdownMenuItem className='text-center' onClick={() => setIsOpen(true)}>
                                            Show Photo
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />



                                        {/* Change photo section */}
                                        <DropdownMenuItem
                                            onSelect={(e) => e.preventDefault()}
                                        >
                                            <label htmlFor="profilePict" className="cursor-pointer" >Change Photo
                                            </label>
                                        </DropdownMenuItem>
                                        {/* Hidden File Input for photo */}
                                        <input
                                            type="file"
                                            id="profilePict"
                                            ref={fileInputRef}
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                    setTempProfilePic(file); // Preview the selected image
                                                }
                                            }}
                                        />

                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            onClick={() => deleteProfilePic()}
                                        >Remove Photo</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            {/* Separate Dialog so profile picture opens properly */}
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

export default ProfileModal;
