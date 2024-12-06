import React from 'react';
import { Badge } from "@/components/ui/badge"


const UserBadgeItem = ({ user, handleFunction }) => {
    return (
        <Badge variant="outline" onClick={handleFunction} className="px-4 py-2 mx-2 my-2 bg-violet-800 text-white flex items-center justify-between" >
            {user.name}
            <i class="fa-solid fa-xmark ml-4 "></i>
        </Badge>

    );
};

export default UserBadgeItem;
