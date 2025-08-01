import mongoose from 'mongoose'
const purchaseSchema = new mongoose.Schema({
    courseId:{type:mongoose.Schema.Types.ObjectId, ref:'Course', required:true},
    userId:{type:String,ref:'UserModel', required:true},
    amount:{type:Number, required:true},
    status:{type:String,enum:['pending','completed', 'failed'] , default:'pending'}
},{timestamps:true});


const PurchaseModel = mongoose.model('purchase',purchaseSchema)
export default PurchaseModel