import commentModel from '../../db/models/comments.model.js';
import { roleEnum } from '../../db/models/user.model.js';
import {asyncHandler} from './../../utils/index.js';


//-----------------CREATE-COMMENT-------------------------
export const createComment = asyncHandler(async (req,res,next)=>{
    const {content} = req.body
    const comment = await commentModel.create({
        content,
        postId : req.post._id,
        userId:  req.user._id
    })
    res.status(201).json({msg : 'success', comment})
})
//---------------UPDATE-COMMENT---------------------------
export const updateComment = asyncHandler(async (req,res,next)=>{
    const {commentId} = req.params
    const {content} = req.body
    let comment = await commentModel.findById(commentId)
    if (!comment){
        return next(new Error('comment not found', {cause : 404}))
    }
    if(!comment.userId.equals(req.user._id) || comment.deletedAt){
        return next(new Error('unauthorized', {cause : 401}))
    }
    comment.content = content
    await comment.save()
    res.status(200).json({msg : 'success', comment})
})
//--------------FREEZE-COMMENT----------------------------
export const freezeComment = asyncHandler(async (req,res,next)=>{
    const {commentId} = req.params
    let comment = await commentModel.findById(commentId)
    if (!comment){
        return next(new Error('comment not found', {cause : 404}))
    }
    if(!comment.userId.equals(req.user._id) && req.user.role !== roleEnum.admin){
        return next(new Error('unauthorized', {cause : 401}))
    }
    comment.deletedAt = Date.now()
    req.user.role == roleEnum.admin ? comment.deletedBy = req.user._id : ''
    await comment.save()
    res.status(200).json({msg : 'success', comment})
})