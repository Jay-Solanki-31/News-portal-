import express from 'express';

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

export default router;