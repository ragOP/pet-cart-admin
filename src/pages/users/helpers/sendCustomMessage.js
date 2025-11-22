import { apiService } from "@/api/api_services";
import { endpoints } from "@/api/endpoint";

export const sendCustomMessage = async ({ channel, title, body, users = [] }) => {
  try {
    if (!Array.isArray(users) || users.length === 0) {
      throw new Error("No users selected.");
    }

    if (!title || !body) {
      throw new Error("Title and body are required.");
    }

    // Extract userIds from users
    const userIds = users
      .map((user) => user._id)
      .filter(Boolean);

    if (userIds.length === 0) {
      throw new Error("No valid user IDs found");
    }

    console.log("Sending custom message:", { channel: channel.id, title, body, userIds });

    // For push notifications, classify users by platform and send separately
    if (channel.id === "push_notification") {
      const results = [];

      // Filter Android users (those with FCM tokens)
      const androidUsers = users
        .filter((user) => user?.fcmToken)
        .map((user) => user._id);

      // Filter iOS users (those with APN tokens)
      const iosUsers = users
        .filter((user) => user?.apnToken)
        .map((user) => user._id);

      // Send to Android users if any
      if (androidUsers.length > 0) {
        console.log("📤 Sending Android push notifications:", {
          count: androidUsers.length,
          userIds: androidUsers,
          title,
          body,
        });
        const androidResponse = await apiService({
          endpoint: endpoints.campaign_start,
          method: "POST",
          data: {
            campaignType: "push_notification_andriod",
            userIds: androidUsers,
            title,
            body,
          },
        });
        results.push({ platform: "android", response: androidResponse });
      }

      // Send to iOS users if any
      if (iosUsers.length > 0) {
        console.log("📤 Sending iOS push notifications:", {
          count: iosUsers.length,
          userIds: iosUsers,
          title,
          body,
        });
        const iosResponse = await apiService({
          endpoint: endpoints.campaign_start,
          method: "POST",
          data: {
            campaignType: "push_notification_ios",
            userIds: iosUsers,
            title,
            body,
          },
        });
        results.push({ platform: "ios", response: iosResponse });
      }

      if (results.length === 0) {
        throw new Error("Selected users do not have push notification tokens.");
      }

      return { success: true, results };
    }

    // For other channels (whatsapp, email), use campaign API
    const campaignTypeMap = {
      whatsapp: "whatsapp",
      email: "email",
    };

    const campaignType = campaignTypeMap[channel.id];

    if (!campaignType) {
      throw new Error(`Invalid channel: ${channel.id}`);
    }

    const data = {
      campaignType,
      userIds,
      title,
      body,
    };

    console.log("📤 Sending custom message:", {
      endpoint: endpoints.campaign_start,
      channel: channel.id,
      data,
    });

    const apiResponse = await apiService({
      endpoint: endpoints.campaign_start,
      method: "POST",
      data,
    });

    if (apiResponse?.response?.success) {
      console.log("✅ Custom message sent successfully:", apiResponse.response);
      return apiResponse.response;
    }

    throw new Error("Failed to send custom message");
  } catch (error) {
    console.error("❌ Send custom message error:", error);
    throw error;
  }
};

