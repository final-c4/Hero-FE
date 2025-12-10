/**
 * <pre>
 * TypeScript Name   : client.ts
 * Description : Axios 공통 클라이언트 설정 파일
 *               - API Base URL 설정
 *               - 인증 토큰 자동 주입
 *               - 요청/응답 인터셉터 정의
 *
 * History
 * 2025/12/09 - 동근 최초 작성
 * </pre>
 *
 * @author 동근
 * @version 1.0
 */


import axios, { type InternalAxiosRequestConfig } from 'axios';

//axios 기본 클라이언트 생성
const client = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
    withCredentials: true,
    timeout: 10000,
});

// 요청 인터셉터 (모든 요청 헤더에 Access Token 자동 주입)
client.interceptors.request.use(
    /**
     * 
     * @param {InternalAxiosRequestConfig} config - Axios 요청 설정 정보
     * @returns {InternalAxiosRequestConfig} 토큰이 추가된 요청 설정
     */

    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('accessToken');

        // Access Token 존재 시 Authorization 헤더 설정
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
    //성공 응답은 그대로 반환
    (response) => response,

    /**
     * 
     * @param error  - Axios 오류 객체
     * @returns {Promise} 오류 처리 후 거부된 프로미스 반환
     */
    (error) => {
        if (error.response?.status === 401) {
            console.warn('인증 만료됨: 다시 로그인 필요');
            // 로그인 페이지로 이동 
            // TODO : 나중에 로그인 페이지 만들면 여기로 이동시키기 ex)router.push('/login');
        }
        return Promise.reject(error);
    }
);

export default client;
