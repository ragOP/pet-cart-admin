import { apiService } from "@/api/api_services";
import { endpoints } from "@/api/endpoint";

export const bulkSendReminders = async ({ 
  cartIds, 
  channel, 
  template, 
  notificationData, 
  subOption,
  customers = []
}) => {
  try {
    let data;
    let endpoint;

    // Extract userIds from customers (for push notifications and campaigns)
    const userIds = customers.map(customer => customer.userId?._id || customer.userId).filter(Boolean);

    // For push notifications
    if (channel === "push_notification") {
      data = {
        notificationData: {
          title: notificationData?.title || "",
          body: notificationData?.body || "",
        },
        userIds: userIds.length > 0 ? userIds : cartIds,
        topicOverride: "com.example.app",
      };
      
      // Choose endpoint based on platform
      endpoint = subOption === "ios" 
        ? endpoints.push_notification_ios 
        : endpoints.push_notification_android;
    } 
    // For WhatsApp and Email, use campaign API
    else if (channel === "whatsapp" || channel === "email") {
      data = {
        campaignType: channel, // "whatsapp" or "email"
        userIds: userIds.length > 0 ? userIds : cartIds,
      };
      endpoint = endpoints.campaign_start;
    } 
    // For other channels (fallback)
    else {
      data = { 
        cartIds, 
        channel, 
        template 
      };
      endpoint = `${endpoints.abandoned_carts}/send-reminders`;
    }

    console.log("📤 Sending reminder:", {
      endpoint,
      channel,
      data,
    });

    const apiResponse = await apiService({
      endpoint,
      method: "POST",
      data,
    });

    if (apiResponse?.response?.success) {
      console.log("✅ Reminder sent successfully:", apiResponse.response);
      return apiResponse.response;
    }

    throw new Error("Failed to send reminders");
  } catch (error) {
    console.error("❌ Bulk send reminders error:", error);
    throw error;
  }
};

