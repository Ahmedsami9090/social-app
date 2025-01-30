import mongoose from "mongoose";

const postSchema = mongoose.Schema({
    content : {
        type : String,
        required : true,
        minlength : 3,
        maxlength : 200
    },
    images : {
        type : [{
            url : String,
            public_id : String
        }]
    },
    userId : {
        type : mongoose.Types.ObjectId,
        ref : 'users',
        required : true
    }
})

const postModel = mongoose.model('Post', postSchema)

export default postModel