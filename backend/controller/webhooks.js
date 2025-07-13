import { Webhook } from "svix";
import UserModel from "../models/user.js";

export const clerkWebhooks = async (req, res) => {
    try {
        // 1. Verify webhook signature
        const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
        const payload = JSON.stringify(req.body);
        const headers = {
            "svix-id": req.headers["svix-id"],
            "svix-timestamp": req.headers["svix-timestamp"],
            "svix-signature": req.headers["svix-signature"]
        };

        await whook.verify(payload, headers);

        // 2. Process webhook event
        const { data, type } = req.body;

        switch (type) {
            case 'user.created': {
                // Validate required fields
                if (!data.id || !data.email_addresses?.[0]?.email_address) {
                    return res.status(400).json({ error: "Missing required user data" });
                }

                const userData = {
                    _id: data.id,
                    email: data.email_addresses[0].email_address,
                    name: `${data.first_name || ''} ${data.last_name || ''}`.trim(),
                    imageUrl: data.image_url || '',
                    
                   
                };

                await UserModel.create(userData);
                return res.status(201).json({ success: true });
            }

            case 'user.updated': {
                const updateData = {
                    email: data.email_addresses?.[0]?.email_address,
                    name: `${data.first_name || ''} ${data.last_name || ''}`.trim(),
                    imageUrl: data.image_url,
                    updatedAt: new Date()
                };

                await UserModel.findByIdAndUpdate(
                    data.id,
                    { $set: updateData },
                    { new: true, runValidators: true }
                );
                return res.status(200).json({ success: true });
            }

            case 'user.deleted': {
                await UserModel.findByIdAndDelete(data.id);
                return res.status(200).json({ success: true });
            }

            default:
                return res.status(200).json({ success: true, msg: 'Unhandled event type' });
        }

    } catch (error) {
        console.error('Webhook Error:', error);
        return res.status(400).json({ 
            success: false, 
            error: error.message || 'Webhook processing failed' 
        });
    }
}
