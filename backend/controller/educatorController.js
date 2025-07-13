import {clerkClient} from '@clerk/express'
import Course from '../models/course.js';
import {v2 as cloudinary} from 'cloudinary'
import UserModel from './../models/user.js';
import PurchaseModel from '../models/purchase.js';

// update role to educator//
export const updateRoleToEducator = async(req,res)=>{
    try {
        const userId = req.auth.userId;
        await clerkClient.users.updateUserMetadata(userId, {
            publicMetadata:{role:'educator'}
        })
        res.json({success:true, msg:'You can add course now'})
    } catch (error) {
        res.json({success:false, msg:error.message})
    }
}

// api for add new course//
export const addCourse = async(req,res)=>{
    try {
        const{courseData} = req.body
        const imageFile = req.file
         const educatorId = req.auth().userId
         if(!imageFile){
            return res.json({success:false, msg:"Thumbnail NotAttached"})
         }

         const parsedCourseData = await JSON.parse(courseData)
         parsedCourseData.educator = educatorId
         const newCourse = await Course.create(parsedCourseData)
          const imageUpload =   await cloudinary.uploader.upload(imageFile.path)
          newCourse.courseThumbnail = imageUpload.secure_url
          await newCourse.save()
          res.json({success:true, msg:"Course Added"})
    } catch (error) {
        res.json({success:false, msg:error.message})
    }
}



//api for get educator course//

export const getEducatorCourses = async(req,res)=>{
    try {
          const educator = req.auth().userId;
          const courses = await Course.find({educator})
          res.json({success:true, courses})
    } catch (error) {
         res.json({success:false, msg:error.message})
    }
}


// api for get educator dashboard data(total earning, enrolled student,no.of course)

export const educatorDashboardData= async(req,res)=>{
  try {
      const educator = req.auth().userId;
     const courses = await Course.find({educator});
     const totalCourses = courses.length;

     const courseIds = courses.map(course=>course._id)

     // calculate total earning from purchases//

const purchase = await PurchaseModel.find({
    courseId:{$in:courseIds},
    status:'completed'
})

const totalEarning = purchase.reduce((sum,purchase)=> sum+purchase.amount,0);

// collect unique enrolled student ids with their course title//
const enrolledStudentsData = []
for(const course of courses){
    const students = await UserModel.find({
        _id :{$in:course.enrolledStudents}
    },'name imageUrl');
    students.forEach(student=>{
        enrolledStudentsData.push({
        courseTitle,
        students})
    })


}

res.json({success:true,dashboardData:{
    totalEarning,enrolledStudentsData, totalCourses
}})
    


  } catch (error) {
     res.json({success:false, msg:error.message})
  }

}
// get enrolled students data with purchase data//

export const getEnrolledStudentsData = async(req,re)=>{

    try {
         const educator = req.auth().userId;
           const courses = await Course.find({educator});
             const courseIds = courses.map(course=>course._id);
                const purchases = await PurchaseModel.find({
            courseId:{$in:courseIds},
             status:'completed'
}).populate('userId', 'name imageUrl').populate('courseId', 'courseTitle')
         
const enrolledStudents = purchases.map(purchase=>({
    student:purchase.userId,
    courseTitle:purchase.courseId.courseTitle,
    purchaseDate:purchase.createdAt
}));
res.json({success:true, enrolledStudents})
    } catch (error) {
         res.json({success:false, msg:error.message})
    }
}