import React from 'react'
import { Skeleton } from "@/components/ui/skeleton"


const Loading = () => {
    return (
        <>
            <div className="flex items-center space-x-1 my-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 ml-2">
                    <Skeleton className="h-4 w-[220px]" />
                    <Skeleton className="h-4 w-[170px]" />
                </div>
            </div>

        </>
    )
}

export default Loading
