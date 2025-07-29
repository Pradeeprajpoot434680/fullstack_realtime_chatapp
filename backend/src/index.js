import express from 'express'
import {connectDB} from './lib/db.js'
import authRoute from './routes/auth.route.js'
import messageRouter from './routes/message.route.js'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import { app ,server} from './lib/socket.js'
import { seedDatabase } from './seeds/user.seed.js'
import path from 'path'

const PORT = process.env.PORT;



dotenv.config()
const __dirname = path.resolve()
app.use(express.json({ limit: '5mb' })); 
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());
app.use(cors({
    origin:"http://localhost:5173",
    credentials:true
}))
app.use('/api/auth',authRoute);
app.use('/api/messages',messageRouter);

if(process.env.NODE_ENV == 'production')
{
    app.use(express.static(path.join(__dirname,'../frontend/dist')));
    app.get('*',(req,res)=>{
        res.sendFile(path.join(__dirname,"../frontend","dist","index.html"))
    })
}
server.listen(8000,()=>{
    console.log("server is listening at port "+PORT);
    connectDB()
})