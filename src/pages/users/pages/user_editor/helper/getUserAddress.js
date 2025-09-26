import { apiService } from "@/api/api_services";

export const getUserAddress = async (userId) => {
  try {
    const response = await apiService({
      endpoint: `api/address/get-address/admin/${userId}`,
      method: "GET",
      data: {
        "apiKey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3ODc4ZGUwYjE5MmYyMGJlY2MxNDdhMyIsIm5hbWUiOiJBc3RyYXNvdWwgRGlnaXRhbCBMTFAiLCJhcHBOYW1lIjoiQWlTZW5zeSIsImNsaWVudElkIjoiNjc4NzhkZTBiMTkyZjIwYmVjYzE0NzllIiwiYWN0aXZlUGxhbiI6IkZSRUVfRk9SRVZFUiIsImlhdCI6MTczNjkzNjkyOH0.-oE5QAG2r6yX-Fqz2UtFrf2XcREU6N1pXmxRageANA4",
        "campaignName": "soulmate_text_api",
        "destination": "7763868786",
        "userName": "Astrasoul Digital LLP",
        "templateParams": [],
        "source": "new-landing-page form",
        "media": {},
        "buttons": [],
        "carouselCards": [],
        "location": {},
        "attributes": {},
        "paramsFallbackValue": {}
      },
      headers: {
        "Content-Type": "application/json"
      }
    });

    return response;
  } catch (error) {
    console.error("Error fetching user address:", error);
    return { success: false, error: true, message: "Failed to fetch user address" };
  }
};
