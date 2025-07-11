import mongoose from "mongoose";

// connect to mongodb database//

const connectDB = async()=>{
    mongoose.connection.on("connected",()=>console.log('mongodb connected'))
    await mongoose.connect(`${process.env.MONGODB_URL}`)
}
export default connectDB;