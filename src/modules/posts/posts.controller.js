import { Router } from "express";
import * as POSTS from "./posts.service.js";
import * as VD from "./posts.validation.js";
import {
  fileTypes,
  multerServer,
  AU,
  validateInput,
} from "./../../middleware/index.js";

const postsRouter = Router();

postsRouter.post(
  "/create",
  validateInput(VD.createPostSchema, ["headers"]),
  AU.authenticateUser,
  multerServer(fileTypes.image).fields([
    { name: "content", maxCount: 200 },
    { name: "images", maxCount: 4 },
  ]),
  POSTS.createPost
);

export default postsRouter;
