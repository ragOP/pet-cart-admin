import { BACKEND_URL } from "../endpoint/index"; 
import axios from "axios";
import { getToken } from "@/utils/auth";

export const apiService = async ({
  endpoint,
  method = "GET",
  data,
  params,
  token: _token,
  headers = {},
  customUrl,
  removeToken = false,
  signal,
}) => {
  try {
    const token = getToken();

    const requestHeaders = {
      "ngrok-skip-browser-warning": "true",
      ...headers,
    };

    if (!removeToken && (token || _token)) {
      requestHeaders.Authorization = `Bearer ${_token || token}`;
    }

    const requestObj = {
      url: `${customUrl ? customUrl : BACKEND_URL}/${endpoint}`,
      method,
      params,
      data,
      signal,
      headers: requestHeaders,
    };

    const { data: res } = await axios(requestObj);
    return { response: res };
  } catch (error) {
    console.error(error, "backend endpoint error");
    return { success: false, error: true, ...(error || {}) };
  }
};