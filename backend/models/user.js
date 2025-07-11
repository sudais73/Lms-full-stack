import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
    _d:{type:String, required:true},
    name:{type:String, required:true},
    email:{type:String, required:true},
    imageUrl:{type:String, required:true},
    enrolledCourses:[{
        type:mongoose.Schema.types.ObjectId,
        ref:'Course'
    }]
},{timestamps:true});

const UserModel = mongoose.model("User", userSchema);
export default UserModel;