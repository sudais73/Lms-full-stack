import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/db.js'
import { clerkWebhooks } from './controller/webhooks.js'
import educatorRouter from './route/educator.js'
import { clerkMiddleware } from '@clerk/express'
import connectCloudinary from './config/cloudinary.js'
import courseRouter from './route/course.js'
import userRouter from './route/userRoute.js'

//initialize express//
const app = express()

// connect to database//
   await connectDB()
   
   await connectCloudinary()

// middleware//
app.use(cors())
app.use(clerkMiddleware())

//route//
app.get('/',(req,res)=>res.send("server is running"))
app.post('/clerk',express.raw({ type: 'application/json' }), clerkWebhooks)
app.use('/api/educator',express.json(), educatorRouter)
app.use('/api/course',express.json(), courseRouter)
app.use('/api/user',express.json(), userRouter)

const PORT = process.env.PORT || 5000

app.listen(PORT, () => console.log(`server is listening to ${PORT}`))