export const urlToFile = async (url, filename) => {
  try {
    // Fetch the image from the URL
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    // Convert the response to a Blob
    const blob = await response.blob();

    // Convert the Blob to a File object
    const file = new File([blob], filename, { type: blob.type });

    return file;
  } catch (error) {
    console.error("Error converting URL to file:", error);
    return null;
  }
};
