import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const UserListItem = ({ user, handleFunction }) => {
    return (
        <div
            onClick={handleFunction}
            className="cursor-pointer bg-gray-200 hover:bg-teal-500 hover:text-white w-full flex items-center text-black px-3 py-2 mb-2 rounded-lg"
        >
            <Avatar className="mr-2">
                <AvatarImage src={user.profilePic} alt={user.name} />
                <AvatarFallback>{user.name[0]}</AvatarFallback>
            </Avatar>
            <div>
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs">
                    <strong>Email:</strong> {user.email}
                </p>
            </div>
        </div>
    );
};

export default UserListItem;
