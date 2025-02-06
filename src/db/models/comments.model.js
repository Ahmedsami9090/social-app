import mongoose from "mongoose";

const commentSchema = mongoose.Schema(
  {
    content: {
      type: String,
      maxLength: 100,
      minLength: 3,
    },
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    postId: {
      type: mongoose.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    deletedAt: {
      type: Date,
    },
    deletedBy: {
      type: mongoose.Types.ObjectId,
      ref : 'User'
    },
  },
  {
    timestamps: true,
  }
);
const commentModel = mongoose.model("Comment", commentSchema);

export default commentModel;
