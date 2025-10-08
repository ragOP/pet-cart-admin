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
      // Ensure full-text search queries with spaces/special chars are preserved
      paramsSerializer: {
        serialize: (p) => {
          if (!p || typeof p !== 'object') return '';
          return Object.entries(p)
            .filter(([, v]) => v !== undefined && v !== null && v !== '')
            .map(([k, v]) => {
              const value = typeof v === 'string' ? v : String(v);
              return `${encodeURIComponent(k)}=${encodeURIComponent(value)}`;
            })
            .join('&');
        },
      },
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