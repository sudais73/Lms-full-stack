import express from 'express'
import { getUserData, purchaseCourse, testDab, userEnrolledCourses } from '../controller/userController.js'
const userRouter = express.Router()
userRouter.get('/user-data',getUserData)
userRouter.get('/enrolled-courses',userEnrolledCourses)
userRouter.post('/purchase',purchaseCourse)
userRouter.get('/test-insert', testDab);

export default userRouter