import UserModel from './../models/user.js';
import Course from './../models/course.js';
import PurchaseModel from './../models/purchase.js';
import Stripe from 'stripe';
// get user data//
export const getUserData = async(req,res)=>{

    try {
        const userId = req.auth().userId
        const user = await UserModel.findById(userId)
        if(!user){
            return res.json({success:false, msg:'User Not Found'})
        }

        res.json({success:true, user})
    } catch (error) {
        res.json({success:false, msg:error.message})
    }
}


// users enrolled course with lecture links//
export const userEnrolledCourses = async(req,res)=>{
    try {
         const userId = req.auth().userId
         const userData = await UserModel.findById(userId).populate('enrolledCourses')
         res.json({success:true,enrolledCourses: userData.enrolledCourses})
    } catch (error) {
         res.json({success:false, msg:error.message})
    }
}



export const purchaseCourse = async (req, res) => {
    try {
        const { courseId } = req.body;
        const { origin } = req.headers;
        const userId = req.auth().userId;

        // 1. Validate required fields
        if (!courseId || !userId) {
            return res.status(400).json({ success: false, msg: 'Missing required fields' });
        }

        // 2. Find user and course (in parallel for better performance)
        const [userData, courseData] = await Promise.all([
            UserModel.findById(userId),
            Course.findById(courseId)
        ]);

        if (!userData || !courseData) {
            return res.status(404).json({ success: false, msg: 'User or Course not found' });
        }

        // 3. Calculate amount with discount
        const amount = (courseData.coursePrice - (courseData.discount * courseData.coursePrice / 100)).toFixed(2);

        // 4. Create purchase record
        const purchase = {
            courseId: courseData._id,
            userId,
            amount: parseFloat(amount) // Convert string to number
        };

        const newPurchase = await PurchaseModel.create(purchase);

        // 5. Initialize Stripe
        const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
        const currency = process.env.CURRENCY || 'usd'; // Fallback currency

        // 6. Create Stripe session
        const session = await stripeInstance.checkout.sessions.create({
            payment_method_types: ['card'],
            success_url: `${origin}/loading/my-enrollments`,
            cancel_url: `${origin}/`,
            line_items: [{
                price_data: {
                    currency,
                    product_data: {
                        name: courseData.courseTitle,
                        description: courseData.courseDescription || '' // Added description
                    },
                    unit_amount: Math.round(parseFloat(amount) * 100) // Ensure integer
                },
                quantity: 1
            }],
            mode: 'payment',
            metadata: {
                purchaseId: newPurchase._id.toString(),
                userId: userId.toString()
            }
        });

        // 7. Return session URL
        res.json({ 
            success: true, 
            session_url: session.url 
        });

    } catch (error) {
        console.error('Purchase Error:', error); // Log for debugging
        res.status(500).json({ 
            success: false, 
            msg: error.message || 'Internal server error' 
        });
    }
};