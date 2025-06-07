import asyncHandler from "express-async-handler";


const addOrUpdateNotification = asyncHandler(async (req, res) => {
    /**
     * step#1: take chatId, messageId and validate
     * step#2: check if notification already exists for the other user(s) in the chat
     * step#3: if it exists, update unseed message count and last message
     * step#4: if it does not exist, create a new notification with chatId and userId for this message
     */
});



export {
    addOrUpdateNotification
}