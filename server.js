import express from 'express';
import authRoutes from './routes/authRoutes.js';
import connectMongoDB from './db.js';

const app = express();
const PORT = process.env.PORT || 8000;


// connect mongodb databse
connectMongoDB()

// set template engine
app.set('view engine','ejs');
// home route

app.get('/',(req,res)=>{
    res.render('index',{title:'Home Page'});
});

app.use('/',authRoutes);

app.listen(PORT,()=>{
    console.log(`server is running on http://localhost:${PORT}`);
    
})