import connection from "./db/connectionDb.js";
import commentRouter from "./modules/comments/comments.controller.js";
import postsRouter from "./modules/posts/posts.controller.js";
import userRouter from "./modules/users/users.controller.js";
import cors from "cors";
const bootstrap = async (app, express) => {
  app.use(cors());
  app.use(express.json());
  await connection();
  app.get("/", (req, res, next) => {
    res.json({ msg: "welcome to social app" });
  });
  app.use("/users", userRouter);
  app.use("/posts", postsRouter);
  app.use('/comments', commentRouter)
  app.use("*", (req, res, next) => {
    next(new Error("invalid url", { cause: 404 }));
  });
  app.use((err, req, res, next) => {
    return res.status(err["cause"] || 500).json({
      message: "internal server error",
      error: err.message,
      stack: process.env.MODE === "DEV" ? err.stack : " ",
    });
  });
};

export default bootstrap;
