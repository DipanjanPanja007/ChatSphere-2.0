import React, { useState } from 'react'
import { useToast } from "@/hooks/use-toast"
import axios from 'axios';
import { ChatState } from '../../Context/ChatProvider'
import '../../App.css'
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";


const Signup = () => {

    const [info, setInfo] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        otp: "",
    });
    const [showPass, setShowPass] = useState(false);
    const [showConfirmPass, setShowConfirmPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isOtpReceived, setIsOtpReceived] = useState(false);
    const { toast } = useToast();

    const { darkMode } = ChatState();


    const handelClickPass = () => setShowPass(!showPass);
    const handelClickConfirmPass = () => setShowConfirmPass(!showConfirmPass);

    const submitHandler = async () => {
        if (info.password !== info.confirmPassword) {
            toast({
                title: "Passwords do not match!",
                variant: "error"
            });
            return;
        }

        document.getElementById("email").readOnly = true;

        const formData = new FormData();
        formData.append("name", info.name);
        formData.append("email", info.email);
        formData.append("password", info.password);
        formData.append("otp", info.otp);

        const profilePicFile = document.getElementById("profilePic")?.files?.[0] || null;
        formData.append("profilePic", profilePicFile);

        setLoading(true);

        try {
            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_URI}/api/user/`,
                formData,
                {
                    withCredentials: true,
                    headers: {
                        "Content-Type": "multipart/form-data", // Required for FormData
                    },
                }
            );


            if (response.status !== 200) {
                throw new Error(response.data?.message || "Failed to register");
            }

            // Success message
            toast({
                title: "Registration Successful! Go to login",
                variant: "success"
            });

            // Reset form
            setInfo({
                name: "",
                email: "",
                password: "",
                confirmPassword: "",
                otp: "",
            });

            document.getElementById("profilePic").value = "";

        } catch (error) {
            console.log("Error:", error);
            toast({
                title: error.response?.data?.message || "Something went wrong",
                variant: "error"
            });
        } finally {
            setLoading(false);
        }
    };


    const requestOtp = async () => {

        // check if email is empty
        if (!info.email) {
            toast({
                title: "Email is required",
                variant: "error"
            });
            return;
        }

        // make the email input field unchangable
        document.getElementById("email").readOnly = true;

        try {
            setLoading(true);
            const data = await axios.post(`${import.meta.env.VITE_BACKEND_URI}/api/user/otp`,
                {
                    email: info.email
                }
            )

            // if failed to send OTP
            if (data?.status !== 200) {
                toast({
                    title: "Failed to send OTP, try again",
                    variant: "error"
                });
            }
            toast({
                title: ` OTP sent successfully, check your email: ${info.email}`,
                variant: "success"
            });
            setIsOtpReceived(true);
            setLoading(false);

        } catch (error) {
            toast({
                title: error.message,
                variant: "error"
            });

        }


    };


    return (
        //  main container
        <div className={`flex flex-col space-y-4 p-6 w-full max-w-md mx-auto shadow-md rounded-md ${darkMode ? "dark-bg-black" : "light-bg-gray"}`} >

            {/* input filed: name */}
            <div className="flex flex-col">
                <label htmlFor="name" className={`font-medium mb-1 ${darkMode ? "dark-font" : "light-font"}`}>Name</label>
                <input
                    id="name"
                    type="text"
                    value={info.name}
                    placeholder="Enter your name"
                    onChange={(e) => setInfo((prev) => ({ ...prev, name: e.target.value }))}
                    className={`px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 ${darkMode ? "dark-bg-gray dark-font" : "light-bg-white light-font"}`}
                    required
                />
            </div>

            {/* input filed: email */}
            <div className="flex flex-col">
                <label htmlFor="email" className={`font-medium mb-1 ${darkMode ? "dark-font" : "light-font"}`}>Email</label>
                <input
                    id="email"
                    type="email"
                    value={info.email}
                    placeholder="Enter your email"
                    onChange={(e) => setInfo((prev) => ({ ...prev, email: e.target.value }))}
                    className={`px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 ${darkMode ? "dark-bg-gray dark-font" : "light-bg-white light-font"}`}
                    required
                />
            </div>

            {/* input filed: password */}
            <div className="flex flex-col">
                <label htmlFor="password" className={`font-medium mb-1 ${darkMode ? "dark-font" : "light-font"}`}>Password</label>
                <div className="relative">
                    <input
                        id="password"
                        type={showPass ? 'text' : 'password'}
                        value={info.password}
                        placeholder="Enter your password"
                        onChange={(e) => setInfo((prev) => ({ ...prev, password: e.target.value }))}
                        className={`px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 w-full ${darkMode ? "dark-bg-gray dark-font" : "light-bg-white light-font"}`}
                        required="true"
                    />
                    <button
                        type="button"
                        onClick={handelClickPass}
                        className={`absolute right-2 top-2 text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}
                    >
                        {showPass ? 'Hide' : 'Show'}
                    </button>
                </div>
            </div>

            {/* input filed: confirm password */}
            <div className="flex flex-col">
                <label htmlFor="confirm-password" className={`font-medium mb-1 ${darkMode ? "dark-font" : "light-font"}`}>Confirm Password</label>
                <div className="relative">
                    <input
                        id="confirm-password"
                        type={showConfirmPass ? 'text' : 'password'}
                        value={info.confirmPassword}
                        placeholder="Confirm your password"
                        onChange={(e) => setInfo((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                        className={`px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 w-full ${darkMode ? "dark-bg-gray dark-font" : "light-bg-white light-font"}`}
                        required="true"
                    />
                    <button
                        type="button"
                        onClick={handelClickConfirmPass}
                        className={`absolute right-2 top-2 text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}
                    >
                        {showConfirmPass ? 'Hide' : 'Show'}
                    </button>
                </div>
            </div>

            {/* input filed: profile picture */}
            <div className="flex flex-col">
                <label htmlFor="profilePic"
                    className={`font-medium mb-1 ${darkMode ? "dark-font" : "light-font"}`}
                >Upload your Profile Picture
                </label>
                <input
                    id="profilePic"
                    type="file"
                    accept="image/*"
                    className={`px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 ${darkMode ? "dark-bg-gray text-gray-400 " : "light-bg-white light-font"}`}
                />
            </div>

            {/* request OTP button */}
            {!isOtpReceived && <button
                id='otp_btn'
                type="button"
                onClick={requestOtp}
                className={`px-4 py-2 text-white rounded-md ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'}`}
                disabled={loading}
            >
                {loading ? 'Loading...' : 'Generate OTP'}
            </button>}


            {/* input filed: OTP */}
            {isOtpReceived && <div className="flex flex-col">
                <label htmlFor="otp" className={`font-medium mb-1 ${darkMode ? "dark-font" : "light-font"}`}>Enter otp</label>
                <input
                    id="otp"
                    type="text"
                    value={info.otp}
                    placeholder="Enter otp from email"
                    onChange={(e) => setInfo((prev) => ({ ...prev, otp: e.target.value }))}
                    className={`px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 w-full ${darkMode ? "dark-bg-gray dark-font" : "light-bg-white light-font"}`}
                    required
                />
            </div>}


            {/* submit button */}
            {isOtpReceived && <button
                id='submit_btn'
                type="button"
                onClick={submitHandler}
                className={`px-4 py-2 text-white rounded-md ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'}`}
                disabled={loading}
            >
                {loading ? 'Loading...' : 'Submit'}
            </button>}

            {/* Google login */}
            {/* <GoogleLogin
                onSuccess={credentialResponse => {
                    const credentialResponseDecoded = jwtDecode(credentialResponse.credential);
                    console.log('credentialResponseDecoded', credentialResponseDecoded);
                }}
                onError={() => {
                    console.log('Login Failed');
                }}
            /> */}

        </div>
    )
}

export default Signup
