import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import userRouter from "./routes/user.route.js";
import authRouter from "./routes/auth.route.js";
import cookieParser from "cookie-parser";
import path from 'path';
import { listingRouter } from "./routes/listing.route.js";
dotenv.config();

mongoose
  .connect(process.env.MONGO)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => console.log(err));


const __dirname = path.resolve();

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use("/api/users", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/listings", listingRouter);

const port = 3000 || 4000;

app.listen(port, () => {
  console.log("Listening on port 3000");
});

app.use(express.static(path.join(__dirname, '/client/dist')));
app.get("*", (req, res)=> {
  res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
})

app.use((err, req, res, next) => {
  const statuscode = err.statusCode || 500;
  const message = err.message || "Invalid username or email";

  return res.status(statuscode).json({
    success: false,
    statuscode,
    message,
  });
});
