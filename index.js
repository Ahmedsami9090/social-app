import express from "express";
import bootstrap from "./src/app.controller.js";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const port = process.env.PORT;
bootstrap(app, express);
app.listen(port, (err) => {
  if (!err) {
    console.log("server connected successfully");
  } else {
    console.log(`error connecting server , ${err}`);
  }
});