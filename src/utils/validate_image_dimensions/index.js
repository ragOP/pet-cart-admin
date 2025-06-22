const dimensionMap = {
  web: {
    horizontal: { width: 1448, height: 250 },
    'short-horizontal': { width: 450, height: 250 },
    'short-vertical': { width: 216, height: 264 },
  },
  tablet: {
    horizontal: { width: 696, height: 200 },
    'short-horizontal': { width: 324, height: 180 },
    'short-vertical': { width: 180, height: 220 },
  },
  app: {
    horizontal: { width: 343, height: 120 },
    'short-horizontal': { width: 144, height: 80 },
    'short-vertical': { width: 120, height: 98 },
  },
};

export const validateImageDimensions = (file, deviceType, bannerType) => {
  return new Promise((resolve) => {
    if (!file || !deviceType || !bannerType) {
      return resolve({ valid: false, error: "Invalid input parameters" });
    }

    const expected = dimensionMap[deviceType]?.[bannerType];
    if (!expected) {
      return resolve({ valid: false, error: "No dimension rule found for the given type" });
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      if (img.width === expected.width && img.height === expected.height) {
        resolve({ valid: true });
      } else {
        resolve({
          valid: false,
          error: `Expected ${expected.width}x${expected.height}, but got ${img.width}x${img.height}`,
        });
      }
      URL.revokeObjectURL(objectUrl);
    };

    img.onerror = () => {
      resolve({ valid: false, error: "Image failed to load" });
      URL.revokeObjectURL(objectUrl);
    };

    img.src = objectUrl;
  });
};
