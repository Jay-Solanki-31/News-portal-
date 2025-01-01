import express from 'express';
import {protactedRoutes } from '../middlewares/authMiddleware.js';
import multer from 'multer';
import path from 'path';
import User from '../model/userModel.js';
import Post from '../model/postModel.js';
import { unlink } from 'fs';
const router = express.Router();


// setup storage engine
const storage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,'uploads/');
    },
    filename:function(req,file,cb){
        cb(null,Date.now() + path.extname(file.originalname));
    }
});

// init upload variable with storage engine
const upload = multer({ storage:storage});

// Home Page Route
router.get('/', async(req,res)=>{
    
    const  page = parseInt(req.query.page) || 1;
    const limit = 2;

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const totalPost = await Post.countDocuments().exec();

    const post = await Post.find().populate({path: 'user',select:'-password'}).sort({_id:-1}).limit(limit).skip(startIndex).exec();

    const pagination = {
        currentPage:page,
        totalPage:Math.ceil(totalPost/limit),
        hasNextPage:endIndex < totalPost,
        hasPrevPage: startIndex > 0,
        nextPage: page + 1,
        pervPage: page - 1
    }

    res.render('index',{title:'Home Page', active:'Home',post,pagination});
});

// route for my post page 
router.get('/my-posts',protactedRoutes,async(req,res)=>{
    try {

        const userId = req.session.user._id;

        const user= await User.findById(userId).populate('posts');
        // console.log(user);
        

        if(!user){
            req.flash('error','User not found');
            res.redirect('/');
        }

    res.render('posts/my-posts',{title:'My Posts', active:'My Posts',posts:user.posts});
 
        
    } catch (error) {
        console.log(error);
        req.flash('error','Error in getting posts');
        res.redirect('/my-posts');
        
    }
});

// route for add post page
router.get('/create-post',protactedRoutes,async(req,res)=>{
    res.render('posts/create-post',{title:'Create Post', active:'Create Post'});
});

// route for edit post page
router.get('/edit-post/:id',protactedRoutes,async(req,res)=>{
    try {

        const postTd = req.params.id;
        const post = await Post.findById(postTd);
        
        if(!post){
            req.flash('error','Post not found');
            res.redirect('/my-posts');
        }
        res.render('posts/edit-post',{title:'Edit Post', active:'Edit Post',post});
        
    } catch (error) {
        console.log(error);
        req.flash('error','Something went wrong');
        res.redirect('/my-posts');
        
    }
});

// route for view post page 
router.get('/post/:slug',async(req,res)=>{
    try {

        const slug = req.params.slug;
        const post = await Post.findOne({slug:slug}).populate('user');

        if(!post){
            req.flash('error','Post not found');
            return res.redirect('/my-post');
        }

    res.render('posts/view-post',{title:'View Post', active:'View Post',post});

        
    } catch (error) {
        console.log(error);
        req.flash('error','Something went wrong');
        res.redirect('/post');
        
    }
});



// route for crete post page
router.post('/create-post',protactedRoutes,upload.single('image'),async(req,res)=>{
    try {   
        const{title,content} = req.body
        const image = req.file.filename;
        const slug = title.replace(/\s+/g, '-').toLowerCase();

        const user = await User.findById(req.session.user._id);

        // create new post

        const post = new Post({title,slug,content,image,user});

        //save post in user post array

        await User.updateOne({_id : req.session.user._id},{$push:{posts:post._id}});

        await post.save();

        req.flash('success','Post created successfully');
        res.redirect('/my-posts');
        
    } catch (error) {
        console.log(error);
        req.flash('error','Something went wrong');
        res.redirect('/create-post');
    }
});


// handle update  post request 
router.post('/update-post/:id',protactedRoutes,upload.single('image'),async(req,res)=>{
    try {
        const postId = req.params.id;
        const post = await Post.findById(postId);
        

        if(!post){
            req.flash('error','Post not found');
            res.redirect('/my-posts');
        }

        post.title = req.body.title;
        post.content = req.body.content;
        post.slug = req.body.title.replace(/\s+/g, '-').toLowerCase();

        if(req.file){
            unlink(path.join(process.cwd(),'uploads') + '/'+ post.image, (err) => { 
                if (err) { 
                    console.error(err); 
                } 
            });
            post.image = req.file.filename;
        }
        
        await post.save();
        req.flash('success','Post updated successfully'); 
        res.redirect('/my-posts');


    } catch (error) {
        console.log(error);
        req.flash('error','Something went wrong');
        res.redirect('/my-posts');
    }
});

// handle delete post request
router.post('/delete-post/:id',protactedRoutes,async(req,res)=>{
    try {

        const postId = req.params.id;
        const post = await Post.findById(postId);

        if(!post){
            req.flash('error','Post not found');
            res.redirect('/my-posts');
        }   

        await User.updateOne({_id : req.session.user._id},{$pull:{posts:postId}});
        await post.deleteOne({_id:postId});

          unlink(path.join(process.cwd(),'uploads') + '/'+ post.image, (err) => { 
                if (err) { 
                    console.error(err); 
                } 
            });  

            req.flash('success','Post deleted successfully');
            res.redirect('/my-posts');
        
    } catch (error) {
        console.log(error);
        req.flash('error','Something went wrong');
        res.redirect('/my-posts');
    }
});

export default router;