import express from "express";
import cors from "cors";

import messageRoutes from "./routes/messageRoutes.js";
import { clerkMiddleware, requireAuth } from "@clerk/express";
import userRouter from "./routes/userRoutes.js";

const app = express();
app.use(cors());
app.use(clerkMiddleware());

app.get("/", (req, res) => {
  res.json({ message: "Chat App Server is Running(Rohit)" });
});

app.use("/api/users", userRouter);

//you will have to make sure not to apply the express.json() middleware to the webhook route,
app.use(express.json());

app.use("/api/messages", messageRoutes);

console.log("hi");

app.get("/api/test", requireAuth(), (req, res) => {
  res.json({ message: "Authenticated", userId: req.auth.userId });
});

export default app;
