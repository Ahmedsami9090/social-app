import postModel from "../../db/models/posts.model.js";
import { asyncHandler, serverUpload } from "./../../utils/index.js";

export const createPost = asyncHandler(async (req, res, next) => {
  const { content } = req.body;
  const { _id } = req.user;
  let imageData = [];
  if (req.files.images?.length) {
    for (const image of req.files.images) {
      const data = await serverUpload(image.path, "posts");
      imageData.push({ url: data.url, public_id: data.public_id });
    }
  }
  const data = await postModel.create({
    content,
    images: imageData,
    userId: _id,
  });
  res.status(201).json({ msf: "created", data });
});
