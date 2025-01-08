import express from 'express';
import User from '../model/userModel.js';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import { guestRoutes, protactedRoutes } from '../middlewares/authMiddleware.js';

const router = express.Router();

// nodemailer setup
var transport = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "f989cb17c8d316",
      pass: "4434170fd8042b"
    }
  });
  
  

router.get('/login',guestRoutes,(req,res)=>{
    res.render('login',{title:'Login Page', active:'Login'});
});

// for register page
router.get('/register',guestRoutes,(req,res)=>{
    res.render('register',{title:'Register Page', active:'Register'});
});

// route for forgot password
router.get('/forgot-password', guestRoutes,(req,res)=>{
    res.render('forgot-password',{title:'Forgot password Page',active:'Forgot-password'});
});

// route for reset password
router.get('/reset-password/:token', guestRoutes, async (req,res)=>{
    const {token} = req.params;
    const user =  await User.findOne({token});
    if(!user){
        req.flash('error','link expired or invalid');
        return res.redirect('/forgot-password');
    }
    res.render('reset-password',{title:'Reset-password Page',active:'Reset-password',token});
});

// route for User Profile
router.get('/profile', protactedRoutes,(req,res)=>{
    res.render('profile',{title:'User Profile Page', active:'Profile'});
});


// handle post request for register
router.post('/register', guestRoutes,async(req,res)=>{
const {name,email,password} = req.body;
try {
    const userExists = await User.findOne({email})

    if(userExists){
        req.flash('error','User already exists');
        return res.redirect('/register');
    }

    const hashedPassword = await bcrypt.hash(password,12); 

    const user = new User({ 
        name,
        email,
        password:hashedPassword
    });

    user.save();
    req.flash('success','User Registered Successfully, you can login now');
    res.redirect('/login');



} catch (error) {
    console.error(error);
    req.flash('error','Something went wrong ,try again');
    res.redirect('/register');  
}  

})


// handel user login request
router.post('/login', guestRoutes, async(req,res)=>{
    const {email,password} = req.body;
    try {
        const user = await User.findOne({email});
        if(user && (await bcrypt.compare(password,user.password))){
            req.session.user = user;
            req.flash('success','User Logged in Successfully');
            res.redirect('/profile');
        }
        else{
           req.flash('error','Invalid Credentials'); 
           res.redirect('/login')
        }
        
    } catch (error) {
        console.error(error);
        req.flash('error','Something went wrong ,try again');
        res.redirect('/register');  
    }  
})


// handle user logout request
router.post('/logout', protactedRoutes,(req,res)=>{
    req.session.destroy();
    res.redirect('/login');
});



// handle forgot-password request
router.post('/forgot_password', async(req, res)=>{
    const  {email} = req.body;

    try {
        const user = await User.findOne({email});
        // console.log(user
        // );
        

        if(!user){
            req.flash('error','User not Found  With this Email');
            return res.redirect('/forgot-password');
        }

        const token = Math.random().toString(36).slice(2);
        // console.log(token);
        user.token = token;
        await user.save();    
        
        const info = await transport.sendMail({
            from: '"Auth" <dayemen963@matmayer.com>',
            to: email,
            subject: "Password Reset",
            text: "Reset Your Password",
            html: `<p>Click this link to reset your password: <a href='http://localhost:8000/reset-password/${token}'>Reset Password</a></p>`,
        });
        
        if (info.messageId) {
            req.flash('success', 'Password reset link sent to your email.');
            return res.redirect('/forgot-password');
        } else {
            req.flash('error', 'Failed to send email. Please try again later.');
            return res.redirect('/forgot-password');
        }
        

    } catch (error) {
        console.error(error);
        req.flash('error','Something went wrong ,try again');
        res.redirect('/forgot-password');  
    }  
});



// handel reset-password request
router.post('/reset-password/', async(req,res)=>{
    const {token,new_password,conform_password} = req.body;
    
    try {

        const user =  await User.findOne({token});
        if(new_password !== conform_password){
            req.flash('error','Password does not match');
            return res.redirect(`/reset-password/${token}`);
        }

        if(!user){
            req.flash('error','invalid token');
            return res.redirect('/forgot-password');
        }

        user.token = null;
        user.password = await bcrypt.hash(new_password,12);
        user.save();
        req.flash('success','Password reset Successfuly');
        res.redirect('/login');
        
    } catch (error) {
        console.error(error);
        req.flash('error','Something went wrong ,try again');
        res.redirect('/reset-password');  
    }  
    

});

export default router;