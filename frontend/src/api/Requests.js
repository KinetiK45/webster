import axios from "axios";
import {logout} from "../utils/Utils";

const ip = new URL(window.location.origin).hostname;
const domain = `http://${ip}:3001/api`;

const axiosInstance = axios.create({
    baseURL: domain,
    headers: {
        'Content-Type':'application/json',
        'Accept':'application/json'
    },
    withCredentials: true
});

axiosInstance.interceptors.response.use(
    response => {
        return response;
    },
    async error => {
        console.log(error);
        if (error.response?.status === 401) {
            await logout();
        }
        if (error.response?.data?.message) {
            return Promise.resolve(error.response);
        }
        return Promise.reject(error);
    }
);

export default class Requests {
    // AUTH
    static async login(username, password){
        let obj = {username:username, password:password};
        const resp = await
            axiosInstance.post('/auth/login', obj);
        return resp.data;
    }
    static async registration(username, password, email, full_name){
        let obj = {
            username: username,
            password: password,
            email: email,
            full_name: full_name
        };
        const resp = await
            axiosInstance.post('/auth/register', obj);
        return resp.data;
    }
    static async passwordResetCreate(email){
        let obj = {email:email};
        const resp = await
            axiosInstance.post('/auth/password-reset', obj);
        return resp.data;
    }
    static async passwordResetConfirm(confirm_token, password){
        let obj = {
            password: password
        };
        const resp = await
            axiosInstance.post(`/auth/password-reset/${confirm_token}`, obj);
        return resp.data;
    }
    static async loginConfirm(confirmationCode) {
        const resp = await axiosInstance
            .post('login-confirm/', {confirm: confirmationCode});
        return resp.data;
    }
    static async logout(){
        const resp = await
            axiosInstance.post(`/auth/logout`);
        return resp.data;
    }

    // USER
    static async user_by_id(user_id){
        const resp = await
            axiosInstance.get(`/users/${user_id}`);
        return resp.data;
    }
}