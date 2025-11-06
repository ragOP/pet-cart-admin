import { apiService } from "@/api/api_services";
import { endpoints } from "@/api/endpoint";

export const sendUserPushNotifications = async ({ users = [] }) => {
  if (!Array.isArray(users) || users.length === 0) {
    throw new Error("No users selected for push notification.");
  }
  const androidUserIds = users
    .filter((user) => Boolean(user?.fcmToken) && Boolean(user?._id))
    .map((user) => user._id);

  const iosUserIds = users
    .filter((user) => Boolean(user?.apnToken) && Boolean(user?._id))
    .map((user) => user._id);

  if (androidUserIds.length === 0 && iosUserIds.length === 0) {
    throw new Error("Selected users do not have push notification tokens.");
  }

  const results = [];

  if (androidUserIds.length > 0) {
    const androidResponse = await apiService({
      endpoint: endpoints.campaign_start,
      method: "POST",
      data: {
        campaignType: "push_notification_andriod",
        userIds: androidUserIds,
      },
    });

    results.push({
      platform: "android",
      response: androidResponse,
    });
  }

  if (iosUserIds.length > 0) {
    const iosResponse = await apiService({
      endpoint: endpoints.campaign_start,
      method: "POST",
      data: {
        campaignType: "push_notification_ios",
        userIds: iosUserIds,
      },
    });

    results.push({
      platform: "ios",
      response: iosResponse,
    });
  }

  return {
    success: true,
    results,
  };
};

