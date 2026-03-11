import axios from 'axios';
import { deleteAllCookies, getCookie, reloadWindow } from './Utils';

const ApiCall = axios.create({
    baseURL: "http://localhost/trust_site",
    timeout: 20000,
    headers: { 'Content-Type': 'application/json' }
});

ApiCall.interceptors.request.use(
    (config) => {
        const token = getCookie('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

ApiCall.interceptors.response.use(
    (response) => {
        return response.data;
    },
    (error) => {
        if (error?.response?.status === 401 || error?.response?.status === 403) {
            deleteAllCookies()
            reloadWindow()
        }
        return Promise.reject(error);
    }
);

export default ApiCall;