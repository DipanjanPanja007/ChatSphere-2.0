import "dotenv/config"
import express from "express";
import cors from "cors";
import bodyParser from 'body-parser';
import { Server } from "socket.io";


import { connectDb } from './config/db.js';
import userRouter from './routes/user.route.js';
import chatRouter from './routes/chat.route.js';
import messageRoutes from './routes/message.route.js';
import { notFound, errorHandler } from './middleware/error.middleware.js';
import cookieParser from 'cookie-parser';



connectDb();
const PORT = process.env.PORT;
const app = express();
app.use(bodyParser.json())
app.use(cookieParser());

app.use(cors({
    origin: process.env.FRONTEND_URI,                // Replace with your frontend's URL
    methods: ["GET", "POST", "PUT", "DELETE"],      // Allowed HTTP methods
    credentials: true,                              // If using cookies or auth headers

}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static("public"));

app.get("/", (_, res) => {
    res.send(`API is running at ${PORT}...`)
});

app.use("/api/user", userRouter);
app.use("/api/chat", chatRouter);
app.use("/api/message", messageRoutes);


app.use(notFound)
app.use(errorHandler)

const server = app.listen(PORT, console.log(`Server has started at PORT ${PORT}`));


const io = new Server(server, {
    pingTimeout: 1200000,
    cors: process.env.FRONTEND_URI,
});

io.on("connection", (socket) => {
    console.log("Connected to socket.io");

    socket.on("setup", (userData) => {
        socket.join(userData._id);
        console.log(userData._id);
        socket.emit("connected")
    })

    socket.on('join_chat', (room) => {
        socket.join(room);
        console.log("user joined room", room);

    });

    socket.on("new_message", ((newMessageRecieced) => {
        let chat = newMessageRecieced.chat;


        if (!chat.users) return console.log("chat.users not defined");

        chat.users.forEach((user) => {
            if (user._id === newMessageRecieced.sender._id) return;
            socket.in(user._id).emit("message_recieved", newMessageRecieced)
        });
    }));

    socket.on("typing", (room) => {
        console.log(`typing is room: ${room}`)
        socket.to(room).emit("typing", room)
    });
    socket.on("stop_typing", (room) => {
        console.log(`stop typing in room: ${room}`)
        socket.to(room).emit("stop_typing", room)
    });

    socket.off("setup", () => {
        console.log("User disconnected");
        socket.leave(userData._id)

    })

});