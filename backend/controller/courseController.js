import Course from "../models/course.js";

// Get All course//

export const getAllCourse= async(req,res)=>{
    // .select(['-courseContent','-enrolledStudents']).populate({path:'educator'})
    try {
        const courses = await Course.find({isPublished:true})
        res.json({success:true, courses})
    } catch (error) {
        res.json({success:false, msg:error.message})
    }
}

// get course by id//

 export const getCourseId = async(req,res)=>{
    const {id}= req.params
    try {
        const courseData = await Course.findById(id)
        // remove lecture url if isPreview free is false//
        courseData.courseContent.forEach(chapter=>{
            chapter.chapterContent.forEach(lecture=>{
                if(!lecture.isPreviewFree){
                    lecture.lectureUrl=""
                }
            })
        })

          res.json({success:true, courseData})
    } catch (error) {
        res.json({success:false, msg:error.message})
    }
    }
