import mongoose from "mongoose";


const memoryOtpSchema = mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true
        },
        otp: {
            type: String,
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now,
            expires: 120 // Automatically delete the document after 2 minutes (120 seconds)
        }
    }
)

const MemoryOtp = mongoose.model("MemoryOtp", memoryOtpSchema);

export { MemoryOtp };