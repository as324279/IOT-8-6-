// front/lib/axios.ts
import axios from "axios";
import { API_BASE_URL } from "../config/apiConfig";

let accessToken: string | null = null;
let refreshToken: string | null = null;

// 앱 시작 시 저장소(AsyncStorage 등)에서 불러오기 로직 추가 가능
export const setTokens = (a?: string|null, r?: string|null) => {
  if (a !== undefined) accessToken = a;
  if (r !== undefined) refreshToken = r;
};

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// (선택) 401 시 리프레시 토큰 재발급 플로우
let isRefreshing = false;
let queue: Array<() => void> = [];

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && refreshToken && !original._retry) {
      if (isRefreshing) {
        await new Promise<void>((resolve) => queue.push(resolve));
        return api(original);
      }
      original._retry = true;
      isRefreshing = true;
      try {
        const { data } = await axios.post(`${API_BASE_URL}/api/auth/refresh`, { refreshToken });
        setTokens(data.accessToken, data.refreshToken); // 필요 시 refreshToken 갱신
        queue.forEach((fn) => fn()); queue = [];
        return api(original);
      } catch (e) {
        // 로그아웃 처리
        setTokens(null, null);
        throw e;
      } finally {
        isRefreshing = false;
      }
    }
    throw error;
  }
);

export default api;
