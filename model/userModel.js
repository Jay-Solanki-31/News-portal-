import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name:String,
    email:String,
    password:String,
    token:String,
    created_at: {
        type: Date,
        default: Date.now
    },
    posts:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    }]
 });

 const User = mongoose.model('User', userSchema);
 export default User;