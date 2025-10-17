import { apiService } from "@/api/api_services";
import { endpoints } from "@/api/endpoint";

export const bulkSendReminders = async ({ channel, customers = [] }) => {
  try {
    // Extract userIds from customers
    const userIds = customers
      .map((customer) => customer.userId?._id)
      .filter(Boolean);

    if (userIds.length === 0) {
      throw new Error("No valid user IDs found");
    }

    console.log(channel, userIds);

    // For push notifications, classify users by platform and send separately
    if (channel === "push_notification") {
      const results = [];

      console.log(customers);

      // Filter Android users (those with FCM tokens)
      const androidUsers = customers
        .filter((customer) => {
          const user = customer.userId;
          return user?.fcmToken;
        })
        .map((customer) => customer.userId?._id);

      // Filter iOS users (those with APN tokens)
      const iosUsers = customers
        .filter((customer) => {
          const user = customer.userId;
          return user?.apnToken;
        })
        .map((customer) => customer.userId?._id || customer.userId);

      // Send to Android users if any
      if (androidUsers.length > 0) {
        const androidResponse = await apiService({
          endpoint: endpoints.campaign_start,
          method: "POST",
          data: {
            campaignType: "push",
            platform: "android",
            userIds: androidUsers,
          },
        });
        results.push({ platform: "android", response: androidResponse });
      }

      // Send to iOS users if any
      if (iosUsers.length > 0) {
        console.log("📤 Sending iOS push notifications:", {
          count: iosUsers.length,
        });
        const iosResponse = await apiService({
          endpoint: endpoints.campaign_start,
          method: "POST",
          data: {
            campaignType: "push",
            platform: "ios",
            userIds: iosUsers,
          },
        });
        results.push({ platform: "ios", response: iosResponse });
      }

      return { success: true, results };
    }

    // For other channels (whatsapp, email), use campaign API
    const campaignTypeMap = {
      whatsapp: "whatsapp",
      email: "email",
    };

    const campaignType = campaignTypeMap[channel];

    if (!campaignType) {
      throw new Error(`Invalid channel: ${channel}`);
    }

    const data = {
      campaignType,
      userIds,
    };

    console.log("📤 Sending reminder:", {
      endpoint: endpoints.campaign_start,
      channel,
      data,
    });

    const apiResponse = await apiService({
      endpoint: endpoints.campaign_start,
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
