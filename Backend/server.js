import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import errorHandler from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import flashcardRoutes from './routes/flashcardRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import quizRoutes from './routes/quizRoutes.js';
import progressRoutes from './routes/progressRoutes.js';


//initialise express app
const app = express();

//connect to MongoDB
connectDB();

//Middleware to handle cors
app.use(
  cors({
    origin: "*",
    methods : ["GET","POST","PUT","DELETE"],
    allowedHeaders:["Content-Type","Authorization"],
    credentials:true,
  })
);

app.use(express.json());
app.use(express.urlencoded({extended:true}));

// Routes
app.use('/api/auth',authRoutes)
app.use('/api/documents',documentRoutes)
app.use('/api/flashcards',flashcardRoutes)
app.use('/api/ai',aiRoutes)
app.use('/api/quizzes',quizRoutes)
app.use('/api/progress',progressRoutes)

app.use(errorHandler);


//404 handler 
app.use((req,res)=>{
  res.status(400).json({
    success:false,
    error:'Route not found',
    statusCode: 404
  })
})

//start server
const PORT = process.env.PORT || 8000;
app.listen(PORT,()=>{
  console.log (`Server running in ${process.env.NODE_ENV} node on port ${PORT}`);
});

process.on('unhandledRejection',(err)=>{
  console.error(`Error: ${err.message}`);
  process.exit(1);
});