import mongoose from "mongoose";
const postSchema = new mongoose.Schema({
    title: String,
    slug: String,
    content: String,
    image: String,
    created_at: {
        type: Date,
        default: Date.now
    },
    user:{
       type: mongoose.Schema.Types.ObjectId,
       ref: 'User'

    }
});

const Post = mongoose.model('Post', postSchema);
export default Post;