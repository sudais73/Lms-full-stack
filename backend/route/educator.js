import express from "express";
import {
    addCourse,
    educatorDashboardData,
    getEducatorCourses,
    getEnrolledStudentsData,
    updateRoleToEducator,
} from "../controller/educatorController.js";
import upload from "../config/multer.js";
import protectEducator from "../middleware/authMiddleware.js";
const educatorRouter = express.Router();
educatorRouter.get("/update-role", updateRoleToEducator);
educatorRouter.post(
    "/add-course",
    upload.single("image"),
    protectEducator,
    addCourse
);
educatorRouter.get("/get-course", protectEducator, getEducatorCourses);
educatorRouter.get("/dashboard", protectEducator, educatorDashboardData);
educatorRouter.get(
    "/enrolled-students",
    protectEducator,
    getEnrolledStudentsData
);

export default educatorRouter;
