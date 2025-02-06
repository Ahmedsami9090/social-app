import mongoose from "mongoose";
import postModel from "../../db/models/posts.model.js";
import { roleEnum } from "../../db/models/user.model.js";
import { asyncHandler, uploadFiles, deleteFiles } from "./../../utils/index.js";

//---------------------CREATE-POST--------------------------------
export const createPost = asyncHandler(async (req, res, next) => {
  const { content } = req.body;
  const { _id } = req.user;
  let filesLink = [];
  if (req.files?.length) {
    filesLink = await uploadFiles(req.files, "posts");
  }
  const data = await postModel.create({
    content,
    images: filesLink,
    userId: _id,
  });
  res.status(201).json({ msf: "created", data });
});
//------------------UPDATE-POST---------------------------------
export const updatePost = asyncHandler(async (req, res, next) => {
  const { postId } = req.body;
  let filesLink = [];
  const post = await postModel.findOne({
    _id: postId,
    userId: req.user._id,
    deletedAt: { $exists: false },
    archivedAt: { $exists: false },
  });
  if (!post) {
    return next(new Error("post not found or unauthorized", { cause: 404 }));
  }
  if (req.files?.length) {
    await deleteFiles(post.images);
    filesLink = await uploadFiles(req.files, "posts");
    post.images = filesLink;
  }
  post.content = req.body.newContent ? req.body.newContent : post.content;
  await post.save();
  res.status(200).json({ msg: "updated", post });
});
//-----------------FREEZE-POST----------------------------------
export const freezePost = asyncHandler(async (req, res, next) => {
  const { postId } = req.params;
  let post = await postModel.findOne({ _id: postId });
  if (!post) {
    return next(new Error("post not found or unauthorized", { cause: 404 }));
  }
  if (!post.userId === req.user._id || !req.user.role === roleEnum.admin) {
    return next(new Error("not permitted", { cause: 401 }));
  }
  post = await postModel.findOneAndUpdate(new mongoose.Types.ObjectId(`${postId}`), {
    $set : {
      deletedAt : Date.now(),
      deletedBy : req.user.role === roleEnum.admin ? req.user._id : null
    }
  }, {new : true, user : req.user})
  res.status(200).json({ msg: "success", post });
});
//--------------RESTORE-POST-----------------------------------
export const restorePost = asyncHandler(async (req, res, next) => {
  const { postId } = req.params;
  let post = await postModel.findOne({
    _id: postId,
    deletedAt: { $exists: true },
  });
  if (!post) {
    return next(new Error("post not found", { cause: 404 }));
  }
  if (!post.userId === req.user._id || !req.user.role === roleEnum.admin) {
    return next(new Error("not permitted", { cause: 401 }));
  }
  post = await postModel.findByIdAndUpdate(
    postId,
    {
      $unset: { deletedAt: 0, deletedBy: 0 },
    },
    { new: true }
  );
  res.status(200).json({ msg: "success", post });
});
//--------------LIKE-OR-UNLIKE-POST------------------------------
export const likeOrUnlikePost = asyncHandler(async (req, res, next) => {
  const { postId } = req.params;
  let post = await postModel.findOne({
    _id: postId,
    deletedAt: { $exists: false },
    archivedAt: { $exists: false },
  });
  if (!post) {
    return next(new Error("post not found", { cause: 404 }));
  }
  if (!post.likes?.includes(req.user._id)) {
    post = await postModel.findByIdAndUpdate(
      { _id: postId },
      { $push: { likes: req.user._id } },
      { new: true }
    );
  } else {
    post = await postModel.findByIdAndUpdate(
      { _id: postId },
      { $pull: { likes: req.user._id } },
      { new: true }
    );
  }
  res
    .status(200)
    .json({ msg: "success", post: { likes: post.likes.length, post } });
});
//------------------------UNDO-POST-----------------------------
export const undoPost = asyncHandler(async (req, res, next) => {
  if (!req.post.userId.equals(req.user._id)) {
    return next(new Error("unauthorized", { cause: 401 }));
  }
  if (new Date(req.post.createdAt).getTime() + 2 * 60 * 1000 < Date.now()) {
    return next(new Error("unable to undo post", { cause: 401 }));
  }
  await deleteFiles(req.post.images);
  const post = await postModel.findOneAndDelete({ _id: req.post._id });
  res.status(200).json({ msg: "success", post });
});
//----------------------ARCHIVE-POST---------------------------
export const archivePost = asyncHandler(async (req, res, next) => {
  if (!req.post.userId.equals(req.user._id)) {
    return next(new Error("unauthorized", { cause: 401 }));
  }
  if (
    new Date(req.post.createdAt).getTime() + 24 * 60 * 60 * 1000 >
    Date.now()
  ) {
    return next(new Error("unable to archive post", { cause: 401 }));
  }
  const post = await postModel.findByIdAndUpdate(req.post._id, {
    archivedAt: Date.now(),
  });
  res.status(200).json({ msg: "success", post });
});
//-------------------GET-PUBLIC-POSTS--------------------------
export const getPublicPosts = asyncHandler(async (req, res, next) => {
  const posts = await postModel.find({
    userId: req.user._id,
    archivedAt: { $exists: false },
    deletedAt: { $exists: false },
  });
  if (!posts) {
    return next(new Error("posts not found", { cause: 404 }));
  }
  res.status(200).json({ msg: "success", posts });
});
//----------------GET-FRIENDS'-POSTS---------------------------
export const getFriendPosts = asyncHandler(async (req, res, next) => {
  if (!req.user.friends?.length) {
    return next(new Error("no friends added yet", { cause: 404 }));
  }
  const data = await postModel.aggregate([
    {
      $match: {
        userId: { $in: req.user.friends },
        archivedAt: { $exists: false },
        deletedAt: { $exists: false },
      },
    },
    { $group: { _id: "$userId", posts : {$push : "$$ROOT" } } },
  ]);
  if (!data) {
    return next(new Error("no posts available", { cause: 404 }));
  }
  res.status(200).json({ msg: "success", data });
});
//----------------GET-USER'S-POSTS-----------------------------
export const getUserPosts = asyncHandler(async (req, res, next) => {
  const stringIds = req.body
  let objectIds = []
  for (let user of stringIds) {
    objectIds.push(new mongoose.Types.ObjectId(`${user}`))
  }
  const data = await postModel.aggregate([
    {
      $match: {
        userId: { $in: objectIds },
        archivedAt: { $exists: false },
        deletedAt: { $exists: false },
      },
    },
    { $group: { _id: "$userId", posts : {$push : "$$ROOT" } } },
  ]);
  if (!data) {
    return next(new Error("no posts available", { cause: 404 }));
  }
  res.status(200).json({ msg: "success", data });
});
