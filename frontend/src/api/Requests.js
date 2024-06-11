import axios from "axios";
import mainPageDataset from './mainPageDataset1.json';
import mainPageDataset2 from './mainPageDataset2.json';
import {logout} from "../utils/Utils";

const ip = new URL(window.location.origin).hostname;
// const ip = '192.168.1.2';
const domain = `https://${ip}:3001/api/`;

const axiosInstance = axios.create({
    baseURL: domain,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    withCredentials: true
})

axiosInstance.interceptors.request.use(request => {
    console.log(`${request.method.toUpperCase()} ${request.url}`, request);
    return request;
}, error => {
    console.error('REQ FAIL: ', error);
    return Promise.reject(error);
});

axiosInstance.interceptors.response.use(
    response => {
        console.log('RES: ', response);
        return response;
    },
    async error => {
        console.error(`${error.config.method.toUpperCase()}: ${error.config.url} ${error.code}`, error);
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
    static async login(username, password) {
        let obj = {username: username, password: password};
        const resp = await
            axiosInstance.post('/auth/login', obj);
        return resp.data;
    }

    static async registration(username, password, email, full_name) {
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

    static async passwordResetCreate(email) {
        let obj = {email: email};
        const resp = await
            axiosInstance.post('/auth/password-reset', obj);
        return resp.data;
    }

    static async passwordResetConfirm(confirm_token, password) {
        let obj = {
            password: password
        };
        const resp = await
            axiosInstance.post(`/auth/password-reset/${confirm_token}`, obj);
        return resp.data;
    }

    static async loginConfirm(confirmationCode) {
        const resp = await axiosInstance
            .post('/auth/login-confirm', {confirm: confirmationCode});
        return resp.data;
    }

    static async logout() {
        const resp = await
            axiosInstance.post(`/auth/logout`);
        return resp.data;
    }

    // USER
    static async user_by_id(user_id) {
        const resp = await
            axiosInstance.get(`/users/${user_id}`);
        return resp.data;
    }

    static async create_project(name) {
        const resp = await axiosInstance
            .post('/projects/create', {project_name: name});
        return resp.data;
    }

    static async avatarUpload(file){
        const data = new FormData();
        data.append('photo', file);
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        };
        const resp = await axiosInstance.patch(`/users/avatar`, data, config);
        return resp.data;
    }

    // PROJECTS
    // file
    static async saveProject(project_id, canvasJson) {
        const resp = await
            axiosInstance.post(`/projects/${project_id}/save`, canvasJson);
        return resp.data;
    }

    static async getUserProjects(user_id = 'me', page = 1, pageSize = 10) {
        const resp = await axiosInstance.get(`/projects/${user_id}/all`, {
            params: {
                page: page,
                pageSize: pageSize
            }
        });
        return resp.data;
    }

    static async getProjects({page = 1, limit = 20, order = 'ASC',
                                 searchValue = '',
                                 dateFrom = '', dateTo = ''}) {
        // const config = {
        //     params: {
        //         page: page,
        //         limit: limit,
        //         order: order,
        //         search: searchValue,
        //         dateFrom: dateFrom,
        //         dateTo: dateTo,
        //     }
        // };
        // const resp = await axiosInstance.get(
        //     `/projects`, config
        // );
        if (page === 1)
            return Promise.resolve(mainPageDataset);
        return Promise.resolve(mainPageDataset2);
        // return resp.data;
    }

    static async getProjectCanvas(project_id){
        const resp = await axiosInstance.get(`/projects/${project_id}`);
        return resp.data;
    }

    static async getProjectDetails(project_id){
        const resp = await axiosInstance.get(`/project_details/${project_id}`);
        return resp.data;
    }

    static async updateProjectDetails(project_id, project_name){
        const resp = await axiosInstance
            .patch(`/project_details/${project_id}`, {project_name});
        return resp.data;
    }
}