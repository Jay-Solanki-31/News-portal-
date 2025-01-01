import express from 'express';
import authRoutes from './routes/authRoutes.js';
import postRoutes from './routes/postRoute.js';
import connectMongoDB from './db.js';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import flash from 'connect-flash';
import path from 'path';
import connectMongoDbSession from 'connect-mongodb-session';
const MongoDBStore = connectMongoDbSession(session);


const app = express();
const PORT = process.env.PORT || 5000;


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
    },
    store: new MongoDBStore({
        uri:process.env.MONGO_DB_URI,
        collection:'sessions'
    })
}));

// set upload folder as static folder
app.use('/uploads',express.static(path.join(process.cwd(),'uploads')));

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


// auth routes
app.use('/',authRoutes);
// post routes
app.use('/',postRoutes);

app.listen(PORT,()=>{
    console.log(`server is running on http://localhost:${PORT}`);
    
})