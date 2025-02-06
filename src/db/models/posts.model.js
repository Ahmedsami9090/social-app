import mongoose from "mongoose";
import commentModel from "./comments.model.js";
import { roleEnum } from "./user.model.js";

const postSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 200,
    },
    images: {
      type: [
        {
          url: String,
          public_id: String,
        },
      ],
    },
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    likes: {
      type: [mongoose.Types.ObjectId],
    },
    deletedAt: {
      type: Date,
    },
    deletedBy: {
      type: mongoose.Types.ObjectId,
      ref : "User"
    },
    archivedAt : {
      type : Date
    }
  },
  {
    timestamps: true,
  }
);

postSchema.pre('findOneAndUpdate', async function (next) {
  const update = this.getUpdate(); 
  const postId = this.getQuery()._id; 
  if (update.$set?.deletedAt) {
    await commentModel.updateMany(
      { postId },
      { $set: { deletedAt: Date.now() } }
    );
  }

  next();
});

const postModel = mongoose.model("Post", postSchema);

export default postModel;
