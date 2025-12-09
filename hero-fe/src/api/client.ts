// src/api/client.ts
import axios, { type InternalAxiosRequestConfig } from 'axios';

const client = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
    withCredentials: true,
    timeout: 10000,
});

// 요청 인터셉터
client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('accessToken');

        if (token) {

            if (config.headers) {
                (config.headers as any).Authorization = `Bearer ${token}`;
            } else {
                config.headers = {
                    Authorization: `Bearer ${token}`,
                } as any;
            }
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// 응답 인터셉터
client.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.warn('인증 만료됨: 다시 로그인 필요');
            // 로그인 페이지로 이동
            // router.push('/login');
        }
        return Promise.reject(error);
    }
);

export default client;
