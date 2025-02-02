import React, { useState } from 'react'
import axios from 'axios';
import { useToast } from "@/hooks/use-toast"
import { useNavigate } from 'react-router-dom';
import { ChatState } from '../../Context/ChatProvider';
import '../../App.css'



const Login = () => {

    const { user, setUser, darkMode } = ChatState();

    const [info, setInfo] = useState({
        email: "",
        password: "",
    });
    const navigate = useNavigate();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);


    const handelClickPass = () => setShowPass(!showPass);

    const submitHandler = async () => {
        if (!info.email.trim() || !info.password.trim()) {
            toast({
                title: "All fields are required!",
                variant: "error"
            });
            return;
        }
        console.log(`email: ${info.email}, pass: ${info.password}`);


        const data = {
            email: info.email,
            password: info.password
        }

        setLoading(true);
        try {

            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URI}/api/user/login`, data, {
                headers: {
                    'Content-Type': 'application/json',
                },
                withCredentials: true,
            });

            const responsedata = response.data

            console.log(responsedata);


            // const userInfoForLocalStorage = await response.data.user.json()

            localStorage.setItem("userInfo", JSON.stringify(responsedata));

            console.log(`response : ${response}`);

            if (!responsedata) {
                toast({
                    title: "Failed to register!",
                    variant: "error"
                });
                console.log("Failed to register!");
                return;
            }

            setUser(responsedata)

            toast({
                title: "Login successful !",
                variant: "success"
            });
            setInfo({
                email: "",
                password: ""
            })

            setLoading(false)
            navigate("/chats");


        } catch (error) {
            toast({
                title: error.message,
                variant: "error"
            });
            console.log("error: ", error)
        } finally {
            setLoading(false);
        }



    };

    return (
        <div className={`flex flex-col gap-4 p-6 max-w-md mx-auto ${darkMode ? "dark-bg-black" : "light-bg-gray"}  rounded-md shadow-md `}>
            <div className="flex flex-col gap-2">
                <label htmlFor="email" className={` ${darkMode ? "dark-font" : "light-font"} text-sm font-medium`}>
                    Email
                </label>
                <input
                    id="email"
                    type="email"
                    value={info.email}
                    placeholder="Enter your email"
                    onChange={(event) => setInfo({ ...info, email: event.target.value })}
                    className={` ${darkMode ? "dark-font dark-bg-gray" : "light-font light-bg-white"} border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring `}
                />
            </div>

            <div className="flex flex-col gap-2">
                <label htmlFor="password" className={` ${darkMode ? "dark-font" : "light-font"} text-sm font-medium`}>
                    Password
                </label>
                <div className="relative">
                    <input
                        id="password"
                        type={showPass ? "text" : "password"}
                        value={info.password}
                        placeholder="Enter Password"
                        onChange={(event) => setInfo({ ...info, password: event.target.value })}
                        className={`border ${darkMode ? "dark-font dark-bg-gray" : "light-font light-bg-white"} border-gray-300 rounded-md px-4 py-2 w-full focus:outline-none focus:ring `}
                    />
                    <button
                        type="button"
                        onClick={handelClickPass}
                        className={`absolute right-2 top-2 text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}
                    >
                        {showPass ? "Hide" : "Show"}
                    </button>
                </div>
            </div>

            <button
                onClick={submitHandler}
                disabled={loading}
                className={`w-full py-2 text-white rounded-md ${loading ? "bg-blue-300" : "bg-blue-500 hover:bg-blue-600"}`}
            >
                {loading ? "Loading..." : "Login"}
            </button>

            <button
                onClick={() => setInfo({ email: "guest@example.com", password: "123456" })}
                className="w-full py-2 text-white bg-red-500 rounded-md hover:bg-red-600"
            >
                Login with Guest User
            </button>
        </div>

    )
}

export default Login
