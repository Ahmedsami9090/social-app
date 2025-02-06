import { Router } from "express";
import * as POSTS from "./posts.service.js";
import * as VD from "./posts.validation.js";
import {
  fileTypes,
  multerServer,
  AU,
  validateInput,
  validatePost,
} from "./../../middleware/index.js";
import commentRouter from "../comments/comments.controller.js";

const postsRouter = Router({mergeParams : true});
postsRouter.use('/:postId/comments', commentRouter)

postsRouter.post(
  "/create",
  multerServer(fileTypes.image).array('images', 3),
  validateInput(VD.createPostSchema, ['headers', 'body']),
  AU.authenticateUser,
  POSTS.createPost
);
postsRouter.patch(
  '/update',
  multerServer(fileTypes.image).array('images', 3),
  validateInput(VD.updatePostSchema, ['body']),
  AU.authenticateUser,
  POSTS.updatePost
)
postsRouter.delete(
  '/freeze/:postId',
  validateInput(VD.freezePostSchema, ['headers', 'params']),
  AU.authenticateUser,
  POSTS.freezePost
)
postsRouter.patch(
  '/unfreeze/:postId',
  validateInput(VD.unfreezePostSchema, ['headers', 'params']),
  AU.authenticateUser,
  POSTS.restorePost
)
postsRouter.post(
  '/like-unlike/:postId',
  validateInput(VD.likeOrUnlikePostSchema, ['headers', 'params']),
  AU.authenticateUser,
  POSTS.likeOrUnlikePost
)
postsRouter.delete(
  '/undo/:postId',
  validateInput(VD.undoPostSchema, ['headers', 'params']),
  AU.authenticateUser,
  validatePost,
  POSTS.undoPost
)
postsRouter.patch(
  '/archive/:postId',
  validateInput(VD.archivePostSchema, ['headers', 'params']),
  AU.authenticateUser,
  validatePost,
  POSTS.archivePost
)
postsRouter.get(
  '/public',
  validateInput(VD.getPublicPostsSchema, ['headers']),
  AU.authenticateUser,
  POSTS.getPublicPosts
)
postsRouter.get(
  '/friends',
  validateInput(VD.getFriendPostsSchema, ['headers']),
  AU.authenticateUser,
  POSTS.getFriendPosts
)
postsRouter.get(
  '/users',
  validateInput(VD.getUserPostsSchema, ['headers', 'body']),
  AU.authenticateUser,
  POSTS.getUserPosts
)
export default postsRouter;
