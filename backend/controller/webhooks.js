import { Webhook } from "svix";
import UserModel from "../models/user.js";

export const clerkWebhooks = async (req, res) => {
  try {
    // Validate required headers
    const requiredHeaders = ["svix-id", "svix-timestamp", "svix-signature"];
    const missingHeaders = requiredHeaders.filter(header => !req.headers[header]);
    
    if (missingHeaders.length > 0) {
      return res.status(400).json({
        success: false,
        msg: `Missing required headers: ${missingHeaders.join(", ")}`
      });
    }

    // Verify webhook signature
    const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
    await whook.verify(JSON.stringify(req.body), {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"]
    });

    const { data, type } = req.body;

    // Validate webhook payload
    if (!data || !data.id || !type) {
      return res.status(400).json({
        success: false,
        msg: "Invalid webhook payload: missing required fields"
      });
    }

    switch (type) {
      case 'user.created': {
        // Safely extract email with fallback
        const email = data.email_addresses?.[0]?.email_address || null;
        if (!email) {
          return res.status(400).json({
            success: false,
            msg: "Email address is required"
          });
        }

        const userData = {
          _id: data.id,
          email: email,
          name: `${data.first_name || ''} ${data.last_name || ''}`.trim(),
          imageUrl: data.image_url || null,
          createdAt: new Date()
        };

        await UserModel.create(userData);
        return res.status(201).json({ success: true });
      }

      case 'user.updated': {
        const updateData = {
          email: data.email_addresses?.[0]?.email_address,
          name: `${data.first_name || ''} ${data.last_name || ''}`.trim(),
          imageUrl: data.image_url || null,
          updatedAt: new Date()
        };

        // Remove undefined fields
        Object.keys(updateData).forEach(key => 
          updateData[key] === undefined && delete updateData[key]
        );

        const updatedUser = await UserModel.findByIdAndUpdate(
          data.id,
          updateData,
          { new: true }
        );

        if (!updatedUser) {
          return res.status(404).json({
            success: false,
            msg: "User not found"
          });
        }

        return res.status(200).json({ success: true });
      }

      case 'user.deleted': {  // Fixed typo: 'use.deleted' → 'user.deleted'
        const deletedUser = await UserModel.findByIdAndDelete(data.id);
        
        if (!deletedUser) {
          return res.status(404).json({
            success: false,
            msg: "User not found"
          });
        }

        return res.status(200).json({ success: true });
      }

      default:
        return res.status(400).json({
          success: false,
          msg: "Unsupported event type"
        });
    }
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).json({
      success: false,
      msg: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
