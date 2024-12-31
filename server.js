import express from 'express';
import authRoutes from './routes/authRoutes.js';
import connectMongoDB from './db.js';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import flash from 'connect-flash';

const app = express();
const PORT = process.env.PORT || 8000;


// connect mongodb databse
connectMongoDB()

// middleware
app.use(express.json());
app.use(express.urlencoded({extended:true}));

// cookie middleware
app.use(cookieParser(process.env.COOKIE_SECRET));

// session middleware
app.use(session({
    secret:process.env.COOKIE_SECRET,
    resave:false,
    saveUninitialized:false,
    cookie:{
        maxAge: 60000*60*24*7 // 1week
    }
}));


// flase messsage middleware
app.use(flash())

// store flash message for a views
app.use(function(req,res,next){
    res.locals.message = req.flash();
    next();
});       

// set login user session data 
app.use(function(req,res,next){
    res.locals.user = req.session.user || null;
    next();
})

// set template engine
app.set('view engine','ejs');
// home route

// Home Page Route
app.get('/',(req,res)=>{
    res.render('index',{title:'Home Page', active:'Home'});
});

app.use('/',authRoutes);

app.listen(PORT,()=>{
    console.log(`server is running on http://localhost:${PORT}`);
    
})