import express from 'express';
import connectMongoDB from './db.js';

const app = express();
const PORT = process.env.PORT || 8000;


// connect mongodb databse
connectMongoDB()
app.get('/',(req,res)=>{
    res.send('Hello word');
});

app.listen(PORT,()=>{
    console.log(`server is running on http://localhost:${PORT}`);
    
})