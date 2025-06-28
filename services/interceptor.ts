import axios, { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from "axios";
import { clearTokens, getAccessToken, getRefreshToken, storeTokens } from "./tokenStorage";

interface CustomAxiosRequestConfig extends AxiosRequestConfig {
    _retry?: boolean;
}

const api = axios.create({
    baseURL: process.env.EXPO_PUBLIC_BACKEND_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    async (config: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> => {
        const token = await getAccessToken();
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error: AxiosError) => Promise.reject(error)
);

api.interceptors.response.use(
    response => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as CustomAxiosRequestConfig;

        if (
            error.response?.status === 401 &&
            !originalRequest._retry
        ) {
            originalRequest._retry = true;

            try {
                const refreshToken = await getRefreshToken();

                if (!refreshToken) {
                    await clearTokens();
                    return Promise.reject(error);
                }

                const res = await axios.post<{ accessToken: string }>(
                    `${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/refresh-token`,
                    { refreshToken }
                );

                const newAccessToken = res.data.accessToken;
                await storeTokens(newAccessToken, refreshToken);

                originalRequest.headers = {
                    ...originalRequest.headers,
                    Authorization: `Bearer ${newAccessToken}`,
                };

                return api(originalRequest);

            } catch (e) {
                await clearTokens();
                return Promise.reject(e);
            }
        }

        return Promise.reject(error);
    }
);

export default api;