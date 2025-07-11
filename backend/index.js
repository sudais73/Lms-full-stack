import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/db.js'
import { clerkWebhooks } from './controller/webhooks.js'

//initialize express//
const app = express()

// connect to database//
   await connectDB()
// middleware//
app.use(cors())


//route//
app.get('/',(req,res)=>res.send("server is running"))
app.post('/clerk', express.json(), clerkWebhooks)

const PORT = process.env.PORT || 5000

app.listen(PORT, () => console.log(`server is listening to ${PORT}`))