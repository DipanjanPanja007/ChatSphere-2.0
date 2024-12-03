import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast"

const Signup = () => {

    const [info, setInfo] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [showPass, setShowPass] = useState(false);
    const [showConfirmPass, setShowConfirmPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast()
    const navigate = useNavigate();


    const handelClickPass = () => setShowPass(!showPass);
    const handelClickConfirmPass = () => setShowConfirmPass(!showConfirmPass);

    const submitHandler = async () => {
        if (info.password !== info.confirmPassword) {
            toast({
                title: "Passwords do not match!",
                variant: "destructive"
            });
            return;
        }

        const formData = new FormData();
        formData.append('name', info.name);
        formData.append('email', info.email);
        formData.append('password', info.password);

        const profilePicFile = document.getElementById("profilePic").files[0] || null;
        // console.log(`profilePic: ${profilePicFile}`);

        formData.append('profilePic', profilePicFile);

        setLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URI}/api/user/`, {
                method: 'POST',
                credentials: "include",
                body: formData,
            });

            const data = await response.json();
            // console.log(`data : ${data}`);

            if (!response.ok) {
                throw new Error(data.message || "Failed to register");
            }

            // Handle success (e.g., redirect or show success message)
            toast({
                title: "Registration Successful! Go to login",
            });
            // Optionally reset the form
            setInfo({
                name: "",
                email: "",
                password: "",
                confirmPassword: "",
            })
            document.getElementById("profilePic").value = ""

            setLoading(false)

        } catch (error) {
            console.log("error: ", error)
            toast({
                title: error.message,
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="flex flex-col space-y-4 p-6 w-full max-w-md mx-auto bg-white shadow-md rounded-md">
            <div className="flex flex-col">
                <label htmlFor="name" className="font-medium mb-1">Name</label>
                <input
                    id="name"
                    type="text"
                    value={info.name}
                    placeholder="Enter your name"
                    onChange={(e) => setInfo((prev) => ({ ...prev, name: e.target.value }))}
                    className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                    required
                />
            </div>

            <div className="flex flex-col">
                <label htmlFor="email" className="font-medium mb-1">Email</label>
                <input
                    id="email"
                    type="email"
                    value={info.email}
                    placeholder="Enter your email"
                    onChange={(e) => setInfo((prev) => ({ ...prev, email: e.target.value }))}
                    className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                    required
                />
            </div>

            <div className="flex flex-col">
                <label htmlFor="password" className="font-medium mb-1">Password</label>
                <div className="relative">
                    <input
                        id="password"
                        type={showPass ? 'text' : 'password'}
                        value={info.password}
                        placeholder="Enter your password"
                        onChange={(e) => setInfo((prev) => ({ ...prev, password: e.target.value }))}
                        className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 w-full"
                        required
                    />
                    <button
                        type="button"
                        onClick={handelClickPass}
                        className="absolute right-2 top-2 text-sm text-gray-600"
                    >
                        {showPass ? 'Hide' : 'Show'}
                    </button>
                </div>
            </div>

            <div className="flex flex-col">
                <label htmlFor="confirm-password" className="font-medium mb-1">Confirm Password</label>
                <div className="relative">
                    <input
                        id="confirm-password"
                        type={showConfirmPass ? 'text' : 'password'}
                        value={info.confirmPassword}
                        placeholder="Confirm your password"
                        onChange={(e) => setInfo((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                        className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 w-full"
                        required
                    />
                    <button
                        type="button"
                        onClick={handelClickConfirmPass}
                        className="absolute right-2 top-2 text-sm text-gray-600"
                    >
                        {showConfirmPass ? 'Hide' : 'Show'}
                    </button>
                </div>
            </div>

            <div className="flex flex-col">
                <label htmlFor="profilePic" className="font-medium mb-1">Upload your Profile Picture</label>
                <input
                    id="profilePic"
                    type="file"
                    accept="image/*"
                    className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
            </div>

            <button
                type="button"
                onClick={submitHandler}
                className={`px-4 py-2 text-white rounded-md ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'}`}
                disabled={loading}
            >
                {loading ? 'Loading...' : 'Submit'}
            </button>
        </div>
    )
}

export default Signup
