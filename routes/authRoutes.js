import express from 'express';
import User from '../model/userModel.js';
import bcrypt from 'bcryptjs';

const router = express.Router();


router.get('/login',(req,res)=>{
    res.render('login',{title:'Login Page'});
});

// for register page
router.get('/register',(req,res)=>{
    res.render('register',{title:'register Page'});
});

// route for forgot password
router.get('/forgot-password',(req,res)=>{
    res.render('forgot-password',{title:'Forgot password Page'});
});

// route for reset password
router.get('/reset-password',(req,res)=>{
    res.render('reset-password',{title:'reset-password Page'});
});

// route for User Profile
router.get('/profile',(req,res)=>{
    res.render('profile',{title:'User Profile Page'});
});


// handle post request for register
router.post('/register',async(req,res)=>{
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
router.post('/login', async(req,res)=>{
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

export default router;