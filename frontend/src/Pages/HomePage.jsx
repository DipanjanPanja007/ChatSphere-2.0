import React, { useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useNavigate } from 'react-router-dom'
import Login from '@/components/Authentication/Login'
import Signup from '@/components/Authentication/Signup'


const HomePage = () => {

    const navigate = useNavigate()

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("userInfo"));

        if (user) navigate("/chats");

    }, [navigate]);


    return (
        <div className="flex flex-col items-center justify-center h-screen max-w-[600px] w-[90%] mx-auto">
            <div className="bg-white border border-gray-300 rounded-lg p-4 w-full">
                <h1 className="text-3xl font-bold font-lato italic text-black text-center">ChatSphere</h1>
            </div>

            <div className="bg-white border border-gray-300 rounded-lg p-0 w-full mt-3">
                <Tabs defaultValue="login">
                    <TabsList className="flex justify-between border-b border-gray-300">
                        <TabsTrigger value="login" className="w-1/2 py-2">Login</TabsTrigger>
                        <TabsTrigger value="signup" className="w-1/2 py-2">Sign Up</TabsTrigger>
                    </TabsList>
                    <div className="mt-4">
                        <TabsContent value="login">
                            <div className="w-full">
                                <Login />
                            </div>
                        </TabsContent>
                        <TabsContent value="signup">
                            <div className="w-full">
                                <Signup />
                            </div>
                        </TabsContent>
                    </div>
                </Tabs>
            </div>
        </div>
    )
}

export default HomePage
