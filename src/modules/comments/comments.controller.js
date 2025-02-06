import { Router } from "express";
import * as COM from './comments.service.js'
import * as VD from './comments.validation.js'
import { AU, validateInput, validatePost } from "../../middleware/index.js";
const commentRouter = Router({mergeParams:  true})

commentRouter.post(
    '/create',
    validateInput(VD.createCommentSchema, ['headers', 'body', 'params']),
    AU.authenticateUser,
    validatePost,
    COM.createComment
)
commentRouter.patch(
    '/update/:commentId',
    validateInput(VD.updateCommentSchema, ['headers', 'body', 'params']),
    AU.authenticateUser,
    COM.updateComment
)
commentRouter.delete(
    '/freeze/:commentId',
    validateInput(VD.freezeCommentSchema, ['headers', 'body', 'params']),
    AU.authenticateUser,
    COM.freezeComment
)

export default commentRouter