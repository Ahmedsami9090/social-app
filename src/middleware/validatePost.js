import { asyncHandler } from "../utils/index.js";
import postModel from "./../db/models/posts.model.js";

const validatePost = asyncHandler(async (req, res, next) => {
  const { postId } = req.params;  
  const post = await postModel.findById(postId);
  if (!post) {
    return next(new Error("post not found", { cause: 404 }));
  }
  if (post.deletedAt) {
    return next(new Error("cannot comment on this post", { cause: 401 }));
  }
  req.post = post;
  next();
});

export default validatePost;
