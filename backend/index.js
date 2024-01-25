import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import cors from "cors";
import userRouter from './src/api/user.js';
import {config} from './config/index.js';

const app = express();
app.use(bodyParser.json({ limit: "5mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "5mb", extended: true }));

app.use(cors());
app.use("/api/user", userRouter);

mongoose
  .connect(config.mongodbURL)
  .then(() =>
    app.listen(config.port, () => console.log(`Server Started On Port ${config.port}`))
  )
  .catch((error) => console.log(error.message));
