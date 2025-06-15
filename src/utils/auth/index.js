import { jwtDecode } from "jwt-decode";
import { getItem, removeItem } from "../local_storage";

const TOKEN_KEY = "token";

export const getToken = () => {
  const accessToken = getItem(TOKEN_KEY);
  return accessToken;
};

export const removeToken = () => {
  removeItem(TOKEN_KEY);
};

export const isTokenValid = () => {
  const token = getToken();
  if (!token) return false;

  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp > currentTime;
  } catch (error) {
    console.error(error);
    return false;
  }
};

export const autoLogout = (logoutCallback) => {
  const token = getToken();
  if (!token) return;

  try {
    const decoded = jwtDecode(token);
    const expiresIn = decoded.exp * 1000 - Date.now();

    if (expiresIn > 0) {
      setTimeout(() => {
        removeToken();
        logoutCallback();
      }, expiresIn);
    } else {
      removeToken();
      logoutCallback();
    }
  } catch (error) {
    console.error(error);
    removeToken();
    logoutCallback();
  }
};
